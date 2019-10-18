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
"""models for email reports

Revision ID: 6c7537a6004a
Revises: e502db2af7be
Create Date: 2018-05-15 20:28:51.977572

"""

# revision identifiers, used by Alembic.
revision = "6c7537a6004a"
down_revision = "a61b40f9f57f"

import sqlalchemy as sa
from alembic import op


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "dashboard_email_schedules",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=True),
        sa.Column("crontab", sa.String(length=50), nullable=True),
        sa.Column("recipients", sa.Text(), nullable=True),
        sa.Column("deliver_as_group", sa.Boolean(), nullable=True),
        sa.Column(
            "delivery_type",
            sa.Enum("attachment", "inline", name="emaildeliverytype"),
            nullable=True,
        ),
        sa.Column("dashboard_id", sa.Integer(), nullable=True),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["changed_by_fk"], ["ab_user.id"]),
        sa.ForeignKeyConstraint(["created_by_fk"], ["ab_user.id"]),
        sa.ForeignKeyConstraint(["dashboard_id"], ["dashboards.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["ab_user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_dashboard_email_schedules_active"),
        "dashboard_email_schedules",
        ["active"],
        unique=False,
    )
    op.create_table(
        "slice_email_schedules",
        sa.Column("created_on", sa.DateTime(), nullable=True),
        sa.Column("changed_on", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=True),
        sa.Column("crontab", sa.String(length=50), nullable=True),
        sa.Column("recipients", sa.Text(), nullable=True),
        sa.Column("deliver_as_group", sa.Boolean(), nullable=True),
        sa.Column(
            "delivery_type",
            sa.Enum("attachment", "inline", name="emaildeliverytype"),
            nullable=True,
        ),
        sa.Column("slice_id", sa.Integer(), nullable=True),
        sa.Column(
            "email_format",
            sa.Enum("visualization", "data", name="sliceemailreportformat"),
            nullable=True,
        ),
        sa.Column("created_by_fk", sa.Integer(), nullable=True),
        sa.Column("changed_by_fk", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["changed_by_fk"], ["ab_user.id"]),
        sa.ForeignKeyConstraint(["created_by_fk"], ["ab_user.id"]),
        sa.ForeignKeyConstraint(["slice_id"], ["slices.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["ab_user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_slice_email_schedules_active"),
        "slice_email_schedules",
        ["active"],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(
        op.f("ix_slice_email_schedules_active"), table_name="slice_email_schedules"
    )
    op.drop_table("slice_email_schedules")
    op.drop_index(
        op.f("ix_dashboard_email_schedules_active"),
        table_name="dashboard_email_schedules",
    )
    op.drop_table("dashboard_email_schedules")
    # ### end Alembic commands ###
