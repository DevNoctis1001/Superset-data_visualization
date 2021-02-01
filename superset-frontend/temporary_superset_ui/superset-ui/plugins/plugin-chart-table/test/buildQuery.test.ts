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
import { QueryMode } from '@superset-ui/core';
import buildQuery from '../src/buildQuery';
import { TableChartFormData } from '../src/types';

const basicFormData: TableChartFormData = {
  viz_type: 'table',
  datasource: '11__table',
};

describe('plugin-chart-table', () => {
  describe('buildQuery', () => {
    it('should add post-processing in aggregate mode', () => {
      const query = buildQuery({
        ...basicFormData,
        query_mode: QueryMode.aggregate,
        metrics: ['aaa'],
        percent_metrics: ['pct_abc'],
      }).queries[0];
      expect(query.metrics).toEqual(['aaa', 'pct_abc']);
      expect(query.post_processing).toEqual([
        {
          operation: 'contribution',
          options: {
            columns: ['pct_abc'],
            rename_columns: ['%pct_abc'],
          },
        },
      ]);
    });

    it('should not add post-processing when there is not percent metric', () => {
      const query = buildQuery({
        ...basicFormData,
        query_mode: QueryMode.aggregate,
        metrics: ['aaa'],
        percent_metrics: [],
      }).queries[0];
      expect(query.metrics).toEqual(['aaa']);
      expect(query.post_processing).toEqual([]);
    });

    it('should not add post-processing in raw records mode', () => {
      const query = buildQuery({
        ...basicFormData,
        query_mode: QueryMode.raw,
        metrics: ['aaa'],
        columns: ['rawcol'],
        percent_metrics: ['ccc'],
      }).queries[0];
      expect(query.metrics).toEqual([]);
      expect(query.columns).toEqual(['rawcol']);
      expect(query.post_processing).toEqual([]);
    });
  });
});
