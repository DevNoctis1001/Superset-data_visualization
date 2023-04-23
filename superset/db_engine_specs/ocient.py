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

import re
import threading
from typing import Any, Callable, Dict, List, NamedTuple, Optional, Pattern, Set, Tuple

from flask_babel import gettext as __
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy.orm import Session

# Need to try-catch here because pyocient may not be installed
try:
    # Ensure pyocient inherits Superset's logging level
    import pyocient

    from superset import app

    superset_log_level = app.config["LOG_LEVEL"]
    pyocient.logger.setLevel(superset_log_level)
except ImportError as e:
    pass

from superset.db_engine_specs.base import BaseEngineSpec
from superset.errors import SupersetErrorType
from superset.models.core import Database
from superset.models.sql_lab import Query

# Regular expressions to catch custom errors

CONNECTION_INVALID_USERNAME_REGEX = re.compile(
    r"The referenced user does not exist \(User '(?P<username>.*?)' not found\)"
)
CONNECTION_INVALID_PASSWORD_REGEX = re.compile(
    r"The userid/password combination was not valid \(Incorrect password for user\)"
)
CONNECTION_INVALID_HOSTNAME_REGEX = re.compile(
    r"Unable to connect to (?P<host>.*?):(?P<port>.*?)"
)
CONNECTION_UNKNOWN_DATABASE_REGEX = re.compile(
    r"No database named '(?P<database>.*?)' exists"
)
CONNECTION_INVALID_PORT_ERROR = re.compile("Port out of range 0-65535")
INVALID_CONNECTION_STRING_REGEX = re.compile(
    r"An invalid connection string attribute was specified"
    r" \(failed to decrypt cipher text\)"
)
SYNTAX_ERROR_REGEX = re.compile(
    r"There is a syntax error in your statement \((?P<qualifier>.*?)"
    r" input '(?P<input>.*?)' expecting (?P<expected>.*?)\)"
)
TABLE_DOES_NOT_EXIST_REGEX = re.compile(
    r"The referenced table or view '(?P<table>.*?)' does not exist"
)
COLUMN_DOES_NOT_EXIST_REGEX = re.compile(
    r"The reference to column '(?P<column>.*?)' is not valid"
)


# Custom datatype conversion functions


def _to_hex(data: bytes) -> str:
    """
    Converts the bytes object into a string of hexadecimal digits.

    :param data: the bytes object
    :returns: string of hexadecimal digits representing the bytes
    """
    return data.hex()


def _polygon_to_json(polygon: Any) -> str:
    """
    Converts the _STPolygon object into its JSON representation.

    :param data: the polygon object
    :returns: JSON representation of the polygon
    """
    json_value = f"{str([[p.long, p.lat] for p in polygon.exterior])}"
    if polygon.holes:
        for hole in polygon.holes:
            json_value += f", {str([[p.long, p.lat] for p in hole])}"
        json_value = f"[{json_value}]"
    return json_value


def _linestring_to_json(linestring: Any) -> str:
    """
    Converts the _STLinestring object into its JSON representation.

    :param data: the linestring object
    :returns: JSON representation of the linestring
    """
    return f"{str([[p.long, p.lat] for p in linestring.points])}"


def _point_to_comma_delimited(point: Any) -> str:
    """
    Returns the x and y coordinates as a comma delimited string.

    :param data: the point object
    :returns: the x and y coordinates as a comma delimited string
    """
    return f"{point.long}, {point.lat}"


# Sanitization function for column values
SanitizeFunc = Callable[[Any], Any]

# Represents a pair of a column index and the sanitization function
# to apply to its values.
PlacedSanitizeFunc = NamedTuple(
    "PlacedSanitizeFunc",
    [
        ("column_index", int),
        ("sanitize_func", SanitizeFunc),
    ],
)

# This map contains functions used to sanitize values for column types
# that cannot be processed natively by Superset.
#
# Superset serializes temporal objects using a custom serializer
# defined in superset/utils/core.py (#json_int_dttm_ser(...)). Other
# are serialized by the default JSON encoder.
#
# Need to try-catch here because pyocient may not be installed
try:
    from pyocient import TypeCodes

    _sanitized_ocient_type_codes: Dict[int, SanitizeFunc] = {
        TypeCodes.BINARY: _to_hex,
        TypeCodes.ST_POINT: _point_to_comma_delimited,
        TypeCodes.IP: str,
        TypeCodes.IPV4: str,
        TypeCodes.ST_LINESTRING: _linestring_to_json,
        TypeCodes.ST_POLYGON: _polygon_to_json,
    }
except ImportError as e:
    _sanitized_ocient_type_codes = {}


def _find_columns_to_sanitize(cursor: Any) -> List[PlacedSanitizeFunc]:
    """
    Cleans the column value for consumption by Superset.

    :param cursor: the result set cursor
    :returns: the list of tuples consisting of the column index and sanitization function
    """
    return [
        PlacedSanitizeFunc(i, _sanitized_ocient_type_codes[cursor.description[i][1]])
        for i in range(len(cursor.description))
        if cursor.description[i][1] in _sanitized_ocient_type_codes
    ]


class OcientEngineSpec(BaseEngineSpec):
    engine = "ocient"
    engine_name = "Ocient"
    # limit_method = LimitMethod.WRAP_SQL
    force_column_alias_quotes = True
    max_column_name_length = 30

    allows_cte_in_subquery = False
    # Ocient does not support cte names starting with underscores
    cte_alias = "cte__"
    # Store mapping of superset Query id -> Ocient ID
    # These are inserted into the cache when executing the query
    # They are then removed, either upon cancellation or query completion
    query_id_mapping: Dict[str, str] = dict()
    query_id_mapping_lock = threading.Lock()

    custom_errors: Dict[Pattern[str], Tuple[str, SupersetErrorType, Dict[str, Any]]] = {
        CONNECTION_INVALID_USERNAME_REGEX: (
            __('The username "%(username)s" does not exist.'),
            SupersetErrorType.CONNECTION_INVALID_USERNAME_ERROR,
            {},
        ),
        CONNECTION_INVALID_PASSWORD_REGEX: (
            __(
                "The user/password combination is not valid"
                " (Incorrect password for user)."
            ),
            SupersetErrorType.CONNECTION_INVALID_PASSWORD_ERROR,
            {},
        ),
        CONNECTION_UNKNOWN_DATABASE_REGEX: (
            __('Could not connect to database: "%(database)s"'),
            SupersetErrorType.CONNECTION_UNKNOWN_DATABASE_ERROR,
            {},
        ),
        CONNECTION_INVALID_HOSTNAME_REGEX: (
            __('Could not resolve hostname: "%(host)s".'),
            SupersetErrorType.CONNECTION_INVALID_HOSTNAME_ERROR,
            {},
        ),
        CONNECTION_INVALID_PORT_ERROR: (
            __("Port out of range 0-65535"),
            SupersetErrorType.CONNECTION_INVALID_PORT_ERROR,
            {},
        ),
        INVALID_CONNECTION_STRING_REGEX: (
            __(
                "Invalid Connection String: Expecting String of"
                " the form 'ocient://user:pass@host:port/database'."
            ),
            SupersetErrorType.GENERIC_DB_ENGINE_ERROR,
            {},
        ),
        SYNTAX_ERROR_REGEX: (
            __('Syntax Error: %(qualifier)s input "%(input)s" expecting "%(expected)s'),
            SupersetErrorType.SYNTAX_ERROR,
            {},
        ),
        TABLE_DOES_NOT_EXIST_REGEX: (
            __('Table or View "%(table)s" does not exist.'),
            SupersetErrorType.TABLE_DOES_NOT_EXIST_ERROR,
            {},
        ),
        COLUMN_DOES_NOT_EXIST_REGEX: (
            __('Invalid reference to column: "%(column)s"'),
            SupersetErrorType.COLUMN_DOES_NOT_EXIST_ERROR,
            {},
        ),
    }
    _time_grain_expressions = {
        None: "{col}",
        "PT1S": "ROUND({col}, 'SECOND')",
        "PT1M": "ROUND({col}, 'MINUTE')",
        "PT1H": "ROUND({col}, 'HOUR')",
        "P1D": "ROUND({col}, 'DAY')",
        "P1W": "ROUND({col}, 'WEEK')",
        "P1M": "ROUND({col}, 'MONTH')",
        "P0.25Y": "ROUND({col}, 'QUARTER')",
        "P1Y": "ROUND({col}, 'YEAR')",
    }

    @classmethod
    def get_table_names(
        cls, database: Database, inspector: Inspector, schema: Optional[str]
    ) -> Set[str]:
        return inspector.get_table_names(schema)

    @classmethod
    def fetch_data(
        cls, cursor: Any, limit: Optional[int] = None
    ) -> List[Tuple[Any, ...]]:
        try:
            rows: List[Tuple[Any, ...]] = super(OcientEngineSpec, cls).fetch_data(
                cursor, limit
            )
        except Exception as exception:
            with OcientEngineSpec.query_id_mapping_lock:
                del OcientEngineSpec.query_id_mapping[
                    getattr(cursor, "superset_query_id")
                ]
            raise exception

        # TODO: Unsure if we need to verify that we are receiving rows:
        if len(rows) > 0 and type(rows[0]).__name__ == "Row":
            # Peek at the schema to determine which column values, if any,
            # require sanitization.
            columns_to_sanitize: List[PlacedSanitizeFunc] = _find_columns_to_sanitize(
                cursor
            )

            if columns_to_sanitize:
                # At least 1 column has to be sanitized.

                def identity(x: Any) -> Any:
                    return x

                # Use the identity function if the column type doesn't need to be
                # sanitized.
                sanitization_functions: List[SanitizeFunc] = [
                    identity for _ in range(len(cursor.description))
                ]
                for info in columns_to_sanitize:
                    sanitization_functions[info.column_index] = info.sanitize_func

                # pyocient returns a list of NamedTuple objects which represent a
                # single row. We have to do this copy because that data type is
                # NamedTuple's are immutable.
                rows = [
                    tuple(
                        sanitize_func(val)
                        for sanitize_func, val in zip(sanitization_functions, row)
                    )
                    for row in rows
                ]
        return rows

    @classmethod
    def epoch_to_dttm(cls) -> str:
        return "DATEADD(S, {col}, '1970-01-01')"

    @classmethod
    def epoch_ms_to_dttm(cls) -> str:
        return "DATEADD(MS, {col}, '1970-01-01')"

    @classmethod
    def get_cancel_query_id(cls, cursor: Any, query: Query) -> Optional[str]:
        # Return a Non-None value
        # If None is returned, Superset will not call cancel_query
        return "DUMMY_VALUE"

    @classmethod
    def handle_cursor(cls, cursor: Any, query: Query, session: Session) -> None:
        with OcientEngineSpec.query_id_mapping_lock:
            OcientEngineSpec.query_id_mapping[query.id] = cursor.query_id

        # Add the query id to the cursor
        setattr(cursor, "superset_query_id", query.id)
        return super().handle_cursor(cursor, query, session)

    @classmethod
    def cancel_query(cls, cursor: Any, query: Query, cancel_query_id: str) -> bool:
        with OcientEngineSpec.query_id_mapping_lock:
            if query.id in OcientEngineSpec.query_id_mapping:
                cursor.execute(f"CANCEL {OcientEngineSpec.query_id_mapping[query.id]}")
                # Query has been cancelled, so we can safely remove the cursor from
                # the cache
                del OcientEngineSpec.query_id_mapping[query.id]
                return True
            # If the query is not in the cache, it must have either been cancelled
            # elsewhere or completed
            return False
