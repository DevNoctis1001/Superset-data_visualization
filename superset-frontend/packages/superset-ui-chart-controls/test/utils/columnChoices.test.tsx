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
import { DatasourceType, testQueryResponse } from '@superset-ui/core';
import { columnChoices } from '../../src';

describe('columnChoices()', () => {
  it('should convert columns to choices when source is a Dataset', () => {
    expect(
      columnChoices({
        id: 1,
        metrics: [],
        type: DatasourceType.Table,
        main_dttm_col: 'test',
        time_grain_sqla: 'P1D',
        columns: [
          {
            column_name: 'fiz',
          },
          {
            column_name: 'about',
            verbose_name: 'right',
          },
          {
            column_name: 'foo',
            verbose_name: 'bar',
          },
        ],
        verbose_map: {},
        column_formats: { fiz: 'NUMERIC', about: 'STRING', foo: 'DATE' },
        currency_formats: {},
        datasource_name: 'my_datasource',
        description: 'this is my datasource',
      }),
    ).toEqual([
      ['foo', 'bar'],
      ['fiz', 'fiz'],
      ['about', 'right'],
    ]);
  });

  it('should return empty array when no columns', () => {
    expect(columnChoices(undefined)).toEqual([]);
  });

  it('should convert columns to choices when source is a Query', () => {
    expect(columnChoices(testQueryResponse)).toEqual([
      ['Column 1', 'Column 1'],
      ['Column 2', 'Column 2'],
      ['Column 3', 'Column 3'],
    ]);
    expect.anything();
  });
});
