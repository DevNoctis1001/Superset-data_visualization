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
from flask_babel import lazy_gettext as _

from superset.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    DeleteFailedError,
    UpdateFailedError,
)


class SSHTunnelDeleteFailedError(DeleteFailedError):
    message = _("SSH Tunnel could not be deleted.")


class SSHTunnelNotFoundError(CommandException):
    status = 404
    message = _("SSH Tunnel not found.")


class SSHTunnelInvalidError(CommandInvalidError):
    message = _("SSH Tunnel parameters are invalid.")


class SSHTunnelUpdateFailedError(UpdateFailedError):
    message = _("SSH Tunnel could not be updated.")
