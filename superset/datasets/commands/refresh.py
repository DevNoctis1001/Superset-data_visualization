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
import logging
from typing import Optional

from flask_appbuilder.security.sqla.models import User

from superset.commands.base import BaseCommand
from superset.connectors.sqla.models import SqlaTable
from superset.datasets.commands.exceptions import (
    DatasetForbiddenError,
    DatasetNotFoundError,
    DatasetRefreshFailedError,
)
from superset.datasets.dao import DatasetDAO
from superset.exceptions import SupersetSecurityException
from superset.views.base import check_ownership

logger = logging.getLogger(__name__)


class RefreshDatasetCommand(BaseCommand):
    def __init__(self, user: User, model_id: int):
        self._actor = user
        self._model_id = model_id
        self._model: Optional[SqlaTable] = None

    def run(self):
        self.validate()
        try:
            # Updates columns and metrics from the dataset
            self._model.fetch_metadata()
        except Exception as e:
            logger.exception(e)
            raise DatasetRefreshFailedError()
        return self._model

    def validate(self) -> None:
        # Validate/populate model exists
        self._model = DatasetDAO.find_by_id(self._model_id)
        if not self._model:
            raise DatasetNotFoundError()
        # Check ownership
        try:
            check_ownership(self._model)
        except SupersetSecurityException:
            raise DatasetForbiddenError()
