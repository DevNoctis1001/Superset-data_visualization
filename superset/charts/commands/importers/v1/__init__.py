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
from typing import Any, Dict, Set

from marshmallow import Schema
from sqlalchemy.orm import Session

from superset.charts.commands.exceptions import ChartImportError
from superset.charts.commands.importers.v1.utils import import_chart
from superset.charts.dao import ChartDAO
from superset.charts.schemas import ImportV1ChartSchema
from superset.commands.importers.v1 import ImportModelsCommand
from superset.connectors.sqla.models import SqlaTable
from superset.databases.commands.importers.v1.utils import import_database
from superset.databases.schemas import ImportV1DatabaseSchema
from superset.datasets.commands.importers.v1.utils import import_dataset
from superset.datasets.schemas import ImportV1DatasetSchema


class ImportChartsCommand(ImportModelsCommand):

    """Import charts"""

    dao = ChartDAO
    model_name = "chart"
    prefix = "charts/"
    schemas: Dict[str, Schema] = {
        "charts/": ImportV1ChartSchema(),
        "datasets/": ImportV1DatasetSchema(),
        "databases/": ImportV1DatabaseSchema(),
    }
    import_error = ChartImportError

    @staticmethod
    def _import(
        session: Session, configs: Dict[str, Any], overwrite: bool = False
    ) -> None:
        # discover datasets associated with charts
        dataset_uuids: Set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("charts/"):
                dataset_uuids.add(config["dataset_uuid"])

        # discover databases associated with datasets
        database_uuids: Set[str] = set()
        for file_name, config in configs.items():
            if file_name.startswith("datasets/") and config["uuid"] in dataset_uuids:
                database_uuids.add(config["database_uuid"])

        # import related databases
        database_ids: Dict[str, int] = {}
        for file_name, config in configs.items():
            if file_name.startswith("databases/") and config["uuid"] in database_uuids:
                database = import_database(session, config, overwrite=False)
                database_ids[str(database.uuid)] = database.id

        # import datasets with the correct parent ref
        datasets: Dict[str, SqlaTable] = {}
        for file_name, config in configs.items():
            if (
                file_name.startswith("datasets/")
                and config["database_uuid"] in database_ids
            ):
                config["database_id"] = database_ids[config["database_uuid"]]
                dataset = import_dataset(session, config, overwrite=False)
                datasets[str(dataset.uuid)] = dataset

        # import charts with the correct parent ref
        for file_name, config in configs.items():
            if file_name.startswith("charts/") and config["dataset_uuid"] in datasets:
                # update datasource id, type, and name
                dataset = datasets[config["dataset_uuid"]]
                config.update(
                    {
                        "datasource_id": dataset.id,
                        "datasource_type": "view"
                        if dataset.is_sqllab_view
                        else "table",
                        "datasource_name": dataset.table_name,
                    }
                )
                config["params"].update({"datasource": dataset.uid})

                if config["query_context"]:
                    del config["query_context"]

                import_chart(session, config, overwrite=overwrite)
