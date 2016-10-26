"""Defines the templating context for SQL Lab"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import inspect
import jinja2

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import time
import textwrap
import uuid
import random

from caravel import app
from caravel.utils import CaravelTemplateException

config = app.config


class BaseContext(object):

    """Base class for database-specific jinja context

    There's this bit of magic in ``process_template`` that instantiates only
    the database context for the active database as a ``models.Database``
    object binds it to the context object, so that object methods
    have access to
    that context. This way, {{ hive.latest_partition('mytable') }} just
    knows about the database it is operating in.

    This means that object methods are only available for the active database
    and are given access to the ``models.Database`` object and schema
    name. For globally available methods use ``@classmethod``.
    """
    engine = None

    def __init__(self, database, query):
        self.database = database
        self.query = query
        self.schema = query.schema


class PrestoContext(BaseContext):
    """Presto Jinja context

    The methods described here are namespaced under ``presto`` in the
    jinja context as in ``SELECT '{{ presto.some_macro_call() }}'``
    """
    engine = 'presto'

    @staticmethod
    def _partition_query(table_name, limit=0, order_by=None, filters=None):
        """Returns a partition query

        :param table_name: the name of the table to get partitions from
        :type table_name: str
        :param limit: the number of partitions to be returned
        :type limit: int
        :param order_by: a list of tuples of field name and a boolean
            that determines if that field should be sorted in descending
            order
        :type order_by: list of (str, bool) tuples
        :param filters: a list of filters to apply
        :param filters: dict of field anme  and filter value combinations
        """
        limit_clause = "LIMIT {}".format(limit) if limit else ''
        order_by_clause = ''
        if order_by:
            l = []
            for field, desc in order_by:
                l.append(field + ' DESC' if desc else '')
            order_by_clause = 'ORDER BY ' + ', '.join(l)

        where_clause = ''
        if filters:
            l = []
            for field, value in filters.items():
                l.append("{field} = '{value}'".format(**locals()))
            where_clause = 'WHERE ' + ' AND '.join(l)

        sql = textwrap.dedent("""\
            SHOW PARTITIONS FROM {table_name}
            {where_clause}
            {order_by_clause}
            {limit_clause}
        """).format(**locals())
        return sql

    @staticmethod
    def _schema_table(table_name, schema):
        if '.' in table_name:
            schema, table_name = table_name.split('.')
        return table_name, schema

    def latest_partition(self, table_name):
        """Returns the latest (max) partition value for a table

        :param table_name: the name of the table, can be just the table
            name or a fully qualified table name as ``schema_name.table_name``
        :type table_name: str
        >>> latest_partition('foo_table')
        '2018-01-01'
        """
        table_name, schema = self._schema_table(table_name, self.schema)
        indexes = self.database.get_indexes(table_name, schema)
        if len(indexes[0]['column_names']) < 1:
            raise CaravelTemplateException(
                "The table should have one partitioned field")
        elif len(indexes[0]['column_names']) > 1:
            raise CaravelTemplateException(
                "The table should have a single partitioned field "
                "to use this function. You may want to use "
                "`presto.latest_sub_partition`")
        part_field = indexes[0]['column_names'][0]
        sql = self._partition_query(table_name, 1, [(part_field, True)])
        df = self.database.get_df(sql, schema)
        return df.to_records(index=False)[0][0]

    def latest_sub_partition(self, table_name, **kwargs):
        """Returns the latest (max) partition value for a table

        A filtering criteria should be passed for all fields that are
        partitioned except for the field to be returned. For example,
        if a table is partitioned by (``ds``, ``event_type`` and
        ``event_category``) and you want the latest ``ds``, you'll want
        to provide a filter as keyword arguments for both
        ``event_type`` and ``event_category`` as in
        ``latest_sub_partition('my_table',
            event_category='page', event_type='click')``

        :param table_name: the name of the table, can be just the table
            name or a fully qualified table name as ``schema_name.table_name``
        :type table_name: str
        :param kwargs: keyword arguments define the filtering criteria
            on the partition list. There can be many of these.
        :type kwargs: str
        >>> latest_sub_partition('sub_partition_table', event_type='click')
        '2018-01-01'
        """
        table_name, schema = self._schema_table(table_name, self.schema)
        indexes = self.database.get_indexes(table_name, schema)
        part_fields = indexes[0]['column_names']
        for k in kwargs.keys():
            if k not in k in part_field:
                msg = "Field [{k}] is not part of the partionning key"
                raise CaravelTemplateException(msg)
        if len(kwargs.keys()) != len(part_fields) - 1:
            msg = (
                "A filter needs to be specified for {} out of the "
                "{} fields."
            ).format(len(part_fields)-1, len(part_fields))
            raise CaravelTemplateException(msg)

        for field in part_fields:
            if field not in kwargs.keys():
                field_to_return = field

        sql = self._partition_query(
            table_name, 1, [(field_to_return, True)], kwargs)
        df = self.database.get_df(sql, schema)
        if df.empty:
            return ''
        return df.to_dict()[field_to_return][0]


db_contexes = {}
keys = tuple(globals().keys())
for k in keys:
    o = globals()[k]
    if o and inspect.isclass(o) and issubclass(o, BaseContext):
        db_contexes[o.engine] = o


def get_context(engine_name=None):
    context = {
        'datetime': datetime,
        'random': random,
        'relativedelta': relativedelta,
        'time': time,
        'timedelta': timedelta,
        'uuid': uuid,
    }
    db_context = db_contexes.get(engine_name)
    if engine_name and db_context:
        context[engine_name] = db_context
    return context


def process_template(sql, database=None, query=None):
    """Processes a sql template

    >>> sql = "SELECT '{{ datetime(2017, 1, 1).isoformat() }}'"
    >>> process_template(sql)
    "SELECT '2017-01-01T00:00:00'"
    """

    context = get_context(database.backend if database else None)
    template = jinja2.Template(sql)
    backend = database.backend if database else None

    # instantiating only the context for the active database
    if context and backend in context:
        context[backend] = context[backend](database, query)
    context.update(config.get('JINJA_CONTEXT_ADDONS', {}))
    return template.render(context)
