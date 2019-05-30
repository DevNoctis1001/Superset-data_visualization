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

import { ChartProps, ChartFormDataMetric, AdhocMetric } from '@superset-ui/chart';
import processColumns from './processColumns';
import processMetrics from './processMetrics';
import processData from './processData';

const DTTM_ALIAS = '__timestamp';

type PlainObject = {
  [key: string]: any;
};

function transformData(data: PlainObject[], formData: PlainObject) {
  const { groupby = [], metrics = [], allColumns = [] } = formData;

  const columns = new Set(
    [...groupby, ...metrics, ...allColumns].map(column => column.label || column),
  );

  let records = data;

  // handle timestamp columns
  if (formData.includeTime) {
    columns.add(DTTM_ALIAS);
  }

  // handle percentage columns.
  const percentMetrics: string[] = (formData.percentMetrics || []).map(
    (metric: ChartFormDataMetric) => (metric as AdhocMetric).label || (metric as string),
  );

  if (percentMetrics.length > 0) {
    const sumPercentMetrics = data.reduce((sumMetrics, item) => {
      const newSumMetrics = { ...sumMetrics };
      percentMetrics.forEach(metric => {
        newSumMetrics[metric] = (sumMetrics[metric] || 0) + (item[metric] || 0);
      });
      return newSumMetrics;
    }, {});
    records = data.map(item => {
      const newItem = { ...item };
      percentMetrics.forEach(metric => {
        newItem[`%${metric}`] =
          sumPercentMetrics[metric] !== 0 ? newItem[metric] / sumPercentMetrics[metric] : null;
      });
      return newItem;
    });
    percentMetrics.forEach(metric => {
      columns.add(`%${metric}`);
    });
  }

  // handle sortedby column
  if (formData.timeseriesLimitMetric) {
    const metric = formData.timeseriesLimitMetric.label || formData.timeseriesLimitMetric;
    columns.add(metric);
  }

  return {
    records,
    columns: [...columns],
  };
}

export default function transformProps(chartProps: ChartProps) {
  const { height, datasource, filters, formData, onAddFilter, payload } = chartProps;
  const {
    alignPn,
    colorPn,
    includeSearch,
    metrics: rawMetrics,
    orderDesc,
    pageLength,
    percentMetrics,
    tableFilter,
    tableTimestampFormat,
    timeseriesLimitMetric,
  } = formData;
  const { records, columns } = transformData(payload.data, formData);

  const metrics = processMetrics({
    metrics: rawMetrics,
    percentMetrics,
    records,
  });

  const processedData = processData({
    timeseriesLimitMetric,
    orderDesc,
    records,
    metrics,
  });

  const processedColumns = processColumns({
    columns,
    metrics,
    records,
    tableTimestampFormat,
    datasource,
  });

  return {
    height,
    data: processedData,
    alignPositiveNegative: alignPn,
    colorPositiveNegative: colorPn,
    columns: processedColumns,
    filters,
    includeSearch,
    onAddFilter,
    orderDesc,
    pageLength: pageLength && parseInt(pageLength, 10),
    tableFilter,
  };
}
