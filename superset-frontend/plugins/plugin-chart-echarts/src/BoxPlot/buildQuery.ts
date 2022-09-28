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
import {
  AdhocColumn,
  buildQueryContext,
  ensureIsArray,
  isPhysicalColumn,
} from '@superset-ui/core';
import { boxplotOperator } from '@superset-ui/chart-controls';
import { BoxPlotQueryFormData } from './types';

export default function buildQuery(formData: BoxPlotQueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns: [
        ...(ensureIsArray(formData.columns).length === 0 &&
        formData.granularity_sqla
          ? [formData.granularity_sqla] // for backwards compatible: if columns control is empty and granularity_sqla was set, the time columns is default distributed column.
          : ensureIsArray(formData.columns)
        ).map(col => {
          if (
            isPhysicalColumn(col) &&
            formData.time_grain_sqla &&
            formData?.datetime_columns_lookup?.[col]
          ) {
            return {
              timeGrain: formData.time_grain_sqla,
              columnType: 'BASE_AXIS',
              sqlExpression: col,
              label: col,
              expressionType: 'SQL',
            } as AdhocColumn;
          }
          return col;
        }),
        ...ensureIsArray(formData.groupby),
      ],
      series_columns: formData.groupby,
      post_processing: [boxplotOperator(formData, baseQueryObject)],
    },
  ]);
}
