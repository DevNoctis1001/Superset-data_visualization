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
  AnnotationLayer,
  AnnotationOpacity,
  AnnotationSourceType,
  AnnotationStyle,
  AnnotationType,
  buildQueryObject,
  QueryObject,
} from '../../src/query';

describe('buildQueryObject', () => {
  let query: QueryObject;

  it('should build granularity for sqlalchemy datasources', () => {
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
    });
    expect(query.granularity).toEqual('ds');
  });

  it('should build granularity for druid datasources', () => {
    query = buildQueryObject({
      datasource: '5__druid',
      granularity: 'ds',
      viz_type: 'table',
    });
    expect(query.granularity).toEqual('ds');
  });

  it('should build metrics based on default queryFields', () => {
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      metric: 'sum__num',
      secondary_metric: 'avg__num',
    });
    expect(query.metrics).toEqual(['sum__num', 'avg__num']);
  });

  it('should group custom metric control', () => {
    query = buildQueryObject(
      {
        datasource: '5__table',
        granularity_sqla: 'ds',
        viz_type: 'table',
        my_custom_metric_control: 'sum__num',
      },
      { my_custom_metric_control: 'metrics' },
    );
    expect(query.metrics).toEqual(['sum__num']);
  });

  it('should group custom metric control with predefined metrics', () => {
    query = buildQueryObject(
      {
        datasource: '5__table',
        granularity_sqla: 'ds',
        viz_type: 'table',
        metrics: ['sum__num'],
        my_custom_metric_control: 'avg__num',
      },
      { my_custom_metric_control: 'metrics' },
    );
    expect(query.metrics).toEqual(['sum__num', 'avg__num']);
  });

  it('should build limit', () => {
    const limit = 2;
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      limit,
    });
    expect(query.timeseries_limit).toEqual(limit);
  });

  it('should build order_desc', () => {
    const orderDesc = false;
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      order_desc: orderDesc,
    });
    expect(query.order_desc).toEqual(orderDesc);
  });

  it('should build timeseries_limit_metric', () => {
    const metric = 'country';
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      timeseries_limit_metric: metric,
    });
    expect(query.timeseries_limit_metric).toEqual(metric);
  });

  it('should handle null and non-numeric row_limit and row_offset', () => {
    const baseQuery = {
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      row_limit: null,
    };

    // undefined
    query = buildQueryObject({ ...baseQuery });
    expect(query.row_limit).toBeUndefined();
    expect(query.row_offset).toBeUndefined();

    // null value
    query = buildQueryObject({ ...baseQuery, row_limit: null, row_offset: null });
    expect(query.row_limit).toBeUndefined();
    expect(query.row_offset).toBeUndefined();

    query = buildQueryObject({ ...baseQuery, row_limit: 1000, row_offset: 50 });
    expect(query.row_limit).toStrictEqual(1000);
    expect(query.row_offset).toStrictEqual(50);

    // valid string
    query = buildQueryObject({ ...baseQuery, row_limit: '200', row_offset: '100' });
    expect(query.row_limit).toStrictEqual(200);
    expect(query.row_offset).toStrictEqual(100);

    // invalid string
    query = buildQueryObject({ ...baseQuery, row_limit: 'two hundred', row_offset: 'twenty' });
    expect(query.row_limit).toBeUndefined();
    expect(query.row_offset).toBeUndefined();
  });

  it('should populate annotation_layers', () => {
    const annotationLayers: AnnotationLayer[] = [
      {
        annotationType: AnnotationType.Formula,
        color: '#ff7f44',
        name: 'My Formula',
        opacity: AnnotationOpacity.Low,
        show: true,
        style: AnnotationStyle.Solid,
        value: '10*sin(x)',
        width: 1,
      },
      {
        annotationType: AnnotationType.Interval,
        color: null,
        show: false,
        name: 'My Interval',
        sourceType: AnnotationSourceType.Native,
        style: AnnotationStyle.Dashed,
        value: 1,
        width: 100,
      },
      {
        annotationType: AnnotationType.Event,
        color: null,
        descriptionColumns: [],
        name: 'My Interval',
        overrides: {
          granularity: null,
          time_grain_sqla: null,
          time_range: null,
        },
        sourceType: AnnotationSourceType.Table,
        show: false,
        timeColumn: 'ds',
        style: AnnotationStyle.Dashed,
        value: 1,
        width: 100,
      },
    ];
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      annotation_layers: annotationLayers,
    });
    expect(query.annotation_layers).toEqual(annotationLayers);
  });

  it('should populate url_params', () => {
    const urlParams = { abc: '123' };
    query = buildQueryObject({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: 'table',
      url_params: urlParams,
    });
    expect(query.url_params).toEqual(urlParams);
  });
});
