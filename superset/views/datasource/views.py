# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import json
import pinecone
import openai
from collections import Counter
from typing import Any

from flask import current_app, redirect, request
from flask_appbuilder import expose, permission_name
from flask_appbuilder.api import rison
from flask_appbuilder.security.decorators import has_access, has_access_api
from flask_babel import _
from marshmallow import ValidationError
from sqlalchemy.exc import NoSuchTableError
from sqlalchemy.orm.exc import NoResultFound

from superset import app, db, event_logger, security_manager
from superset.commands.utils import populate_owners
from superset.connectors.sqla.models import SqlaTable
from superset.connectors.sqla.utils import get_physical_table_metadata
from superset.datasets.commands.exceptions import (
    DatasetForbiddenError,
    DatasetNotFoundError,
)
from superset.datasource.dao import DatasourceDAO
from superset.exceptions import SupersetException, SupersetSecurityException
from superset.models.core import Database
from superset.superset_typing import FlaskResponse
from superset.utils.core import DatasourceType
from superset.utils.urls import is_safe_url
from superset.views.base import (
    api,
    BaseSupersetView,
    handle_api_exception,
    json_error_response,
)
from superset.views.datasource.schemas import (
    ExternalMetadataParams,
    ExternalMetadataSchema,
    get_external_metadata_schema,
    SamplesPayloadSchema,
    SamplesRequestSchema,
)
from superset.views.datasource.utils import get_samples
from superset.views.utils import sanitize_datasource_data


class Datasource(BaseSupersetView):
    """Datasource-related views"""

    @expose("/save/", methods=["POST"])
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.save",
        log_to_statsd=False,
    )
    @has_access_api
    @api
    @handle_api_exception
    def save(self) -> FlaskResponse:
        data = request.form.get("data")
        if not isinstance(data, str):
            return json_error_response(_("Request missing data field."), status=500)

        datasource_dict = json.loads(data)
        datasource_id = datasource_dict.get("id")
        datasource_type = datasource_dict.get("type")
        database_id = datasource_dict["database"].get("id")
        default_endpoint = datasource_dict["default_endpoint"]
        if (
            default_endpoint
            and not is_safe_url(default_endpoint)
            and current_app.config["PREVENT_UNSAFE_DEFAULT_URLS_ON_DATASET"]
        ):
            return json_error_response(
                _(
                    "The submitted URL is not considered safe,"
                    " only use URLs with the same domain as Superset."
                ),
                status=400,
            )

        orm_datasource = DatasourceDAO.get_datasource(
            db.session, DatasourceType(datasource_type), datasource_id
        )
        orm_datasource.database_id = database_id

        if "owners" in datasource_dict and orm_datasource.owner_class is not None:
            # Check ownership
            try:
                security_manager.raise_for_ownership(orm_datasource)
            except SupersetSecurityException as ex:
                raise DatasetForbiddenError() from ex

        datasource_dict["owners"] = populate_owners(
            datasource_dict["owners"], default_to_user=False
        )

        duplicates = [
            name
            for name, count in Counter(
                [col["column_name"] for col in datasource_dict["columns"]]
            ).items()
            if count > 1
        ]
        if duplicates:
            return json_error_response(
                _(
                    "Duplicate column name(s): %(columns)s",
                    columns=",".join(duplicates),
                ),
                status=409,
            )
        orm_datasource.update_from_object(datasource_dict)
        data = orm_datasource.data

        # transform the datasource info to vectors
        datasource_table = datasource_dict.get('table_name')
        datasource_schema = datasource_dict.get('schema')
        datasource_columns = datasource_dict.get('columns')
        datasource_desc = datasource_dict.get('description')
        datasource_sel_star= datasource_dict.get('select_star')
        database_backend = datasource_dict['database'].get('backend')
        database_name = datasource_dict['database'].get('name')
        stringified_columns = ""
        for obj in datasource_columns:
            stringified_columns += f"col_name: {obj['column_name']},"
            stringified_columns += f"col_label: {obj['verbose_name']},"
            stringified_columns += f"col_type: {obj['type']},"
            stringified_columns += f"col_desc: {obj['description']}\n"
        to_vectors = ""
        to_vectors += f"# TABLE:\n"
        to_vectors += f"table_name: {datasource_table}\n"
        to_vectors += f"table_schema: {datasource_schema}\n"
        to_vectors += f"table_desc: {datasource_desc}\n"

        to_vectors += f"COLUMNS:\n"
        to_vectors += stringified_columns

        to_vectors += f"EXAMPLE:\n"
        to_vectors += f"{datasource_sel_star}"

        openai.api_key = app.config["OPENAI_API_KEY"]
        pinecone.init(
            api_key=app.config["PINECONE_API_KEY"],
            environment="us-east1-gcp"
        )
        pinecone_index_name = app.config["PINECONE_INDEX_NAME"]
        if pinecone_index_name not in pinecone.list_indexes():
            # if does not exist, create index
            pinecone.create_index(
                name=pinecone_index_name,
                # dimension of OpenAI embeddings
                dimension=1536,
                # use cosine similarity
                metric='cosine'
            )
        # connect to Pinecone index
        pinecone_index = pinecone.Index(pinecone_index_name)
        # create embeddings with OpenAI
        to_vectors_res = openai.Embedding.create(
            input=[to_vectors], engine="text-embedding-ada-002"
        )
        embeddings = to_vectors_res['data'][0]['embedding']
        vector_id = f"datasource-{datasource_id}"
        # upsert vectors for this datasource
        pinecone_index.upsert(
            vectors=[(
                vector_id,
                embeddings,
                {
                    "original": to_vectors,
                    "datasource_id": datasource_id,
                    "datasource_schema": datasource_schema,
                    "database_id": database_id,
                    "database_name": database_name,
                    "database_backend": database_backend
                }
            )],
            namespace="datasource"
        )

        db.session.commit()

        return self.json_response(sanitize_datasource_data(data))

    @expose("/get/<datasource_type>/<datasource_id>/")
    @has_access_api
    @api
    @handle_api_exception
    def get(self, datasource_type: str, datasource_id: int) -> FlaskResponse:
        datasource = DatasourceDAO.get_datasource(
            db.session, DatasourceType(datasource_type), datasource_id
        )
        return self.json_response(sanitize_datasource_data(datasource.data))

    @expose("/external_metadata/<datasource_type>/<datasource_id>/")
    @has_access_api
    @api
    @handle_api_exception
    def external_metadata(
        self, datasource_type: str, datasource_id: int
    ) -> FlaskResponse:
        """Gets column info from the source system"""
        datasource = DatasourceDAO.get_datasource(
            db.session,
            DatasourceType(datasource_type),
            datasource_id,
        )
        try:
            external_metadata = datasource.external_metadata()
        except SupersetException as ex:
            return json_error_response(str(ex), status=400)
        return self.json_response(external_metadata)

    @expose("/external_metadata_by_name/")
    @has_access_api
    @api
    @handle_api_exception
    @rison(get_external_metadata_schema)
    def external_metadata_by_name(self, **kwargs: Any) -> FlaskResponse:
        """Gets table metadata from the source system and SQLAlchemy inspector"""
        try:
            params: ExternalMetadataParams = ExternalMetadataSchema().load(
                kwargs.get("rison")
            )
        except ValidationError as err:
            return json_error_response(str(err), status=400)

        datasource = SqlaTable.get_datasource_by_name(
            session=db.session,
            database_name=params["database_name"],
            schema=params["schema_name"],
            datasource_name=params["table_name"],
        )
        try:
            if datasource is not None:
                # Get columns from Superset metadata
                external_metadata = datasource.external_metadata()
            else:
                # Use the SQLAlchemy inspector to get columns
                database = (
                    db.session.query(Database)
                    .filter_by(database_name=params["database_name"])
                    .one()
                )
                external_metadata = get_physical_table_metadata(
                    database=database,
                    table_name=params["table_name"],
                    schema_name=params["schema_name"],
                )
        except (NoResultFound, NoSuchTableError) as ex:
            raise DatasetNotFoundError() from ex
        return self.json_response(external_metadata)

    @expose("/samples", methods=["POST"])
    @has_access_api
    @api
    @handle_api_exception
    def samples(self) -> FlaskResponse:
        try:
            params = SamplesRequestSchema().load(request.args)
            payload = SamplesPayloadSchema().load(request.json)
        except ValidationError as err:
            return json_error_response(err.messages, status=400)

        rv = get_samples(
            datasource_type=params["datasource_type"],
            datasource_id=params["datasource_id"],
            force=params["force"],
            page=params["page"],
            per_page=params["per_page"],
            payload=payload,
        )
        return self.json_response({"result": rv})


class DatasetEditor(BaseSupersetView):
    route_base = "/dataset"
    class_permission_name = "Dataset"

    @expose("/add/")
    @has_access
    @permission_name("read")
    def root(self) -> FlaskResponse:
        return super().render_app_template()

    @expose("/<pk>", methods=["GET"])
    @has_access
    @permission_name("read")
    # pylint: disable=unused-argument
    def show(self, pk: int) -> FlaskResponse:
        dev = request.args.get("testing")
        if dev is not None:
            return super().render_app_template()
        return redirect("/")
