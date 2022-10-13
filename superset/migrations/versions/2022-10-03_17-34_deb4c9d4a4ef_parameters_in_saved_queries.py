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
"""parameters in saved queries

Revision ID: deb4c9d4a4ef
Revises: 291f024254b5
Create Date: 2022-10-03 17:34:00.721559

"""

# revision identifiers, used by Alembic.
revision = "deb4c9d4a4ef"
down_revision = "291f024254b5"

import sqlalchemy as sa
from alembic import op


def upgrade():
    op.add_column(
        "saved_query",
        sa.Column(
            "template_parameters",
            sa.TEXT(),
            nullable=True,
        ),
    )


def downgrade():
    with op.batch_alter_table("saved_query") as batch_op:
        batch_op.drop_column("template_parameters")
