/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
export const AGGREGATES = {
  AVG: 'AVG',
  COUNT: 'COUNT ',
  COUNT_DISTINCT: 'COUNT_DISTINCT',
  MAX: 'MAX',
  MIN: 'MIN',
  SUM: 'SUM',
};

export const OPERATORS = {
  '==': '==',
  '!=': '!=',
  '>': '>',
  '<': '<',
  '>=': '>=',
  '<=': '<=',
  in: 'in',
  'not in': 'not in',
  LIKE: 'LIKE',
  regex: 'regex',
  'IS NOT NULL': 'IS NOT NULL',
  'IS NULL': 'IS NULL',
};

export const TABLE_ONLY_OPERATORS = [OPERATORS.LIKE];
export const DRUID_ONLY_OPERATORS = [OPERATORS.regex];
export const HAVING_OPERATORS = [
  OPERATORS['=='],
  OPERATORS['!='],
  OPERATORS['>'],
  OPERATORS['<'],
  OPERATORS['>='],
  OPERATORS['<='],
];
export const MULTI_OPERATORS = [OPERATORS.in, OPERATORS['not in']];

export const sqlaAutoGeneratedMetricNameRegex = /^(sum|min|max|avg|count|count_distinct)__.*$/i;
export const sqlaAutoGeneratedMetricRegex = /^(LONG|DOUBLE|FLOAT)?(SUM|AVG|MAX|MIN|COUNT)\([A-Z0-9_."]*\)$/i;
export const druidAutoGeneratedMetricRegex = /^(LONG|DOUBLE|FLOAT)?(SUM|MAX|MIN|COUNT)\([A-Z0-9_."]*\)$/i;

export const EXPLORE_ONLY_VIZ_TYPE = ['separator', 'markup'];
