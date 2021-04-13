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
import React from 'react';
import { render, waitFor } from 'spec/helpers/testing-library';
import fetchMock from 'fetch-mock';
import * as utils from 'src/utils/getClientErrorObject';
import { ColumnSelect } from './ColumnSelect';

fetchMock.get('http://localhost/api/v1/dataset/123', {
  body: {
    result: {
      columns: [
        { column_name: 'column_name_01' },
        { column_name: 'column_name_02' },
        { column_name: 'column_name_03' },
      ],
    },
  },
});
fetchMock.get('http://localhost/api/v1/dataset/456', {
  body: {
    result: {
      columns: [
        { column_name: 'column_name_04' },
        { column_name: 'column_name_05' },
        { column_name: 'column_name_06' },
      ],
    },
  },
});

fetchMock.get('http://localhost/api/v1/dataset/789', { status: 404 });

const createProps = () => ({
  filterId: 'filterId',
  form: { getFieldValue: jest.fn(), setFields: jest.fn() },
  datasetId: 123,
  value: 'column_name_01',
  onChange: jest.fn(),
});

afterAll(() => {
  fetchMock.restore();
});

test('Should render', () => {
  const props = createProps();
  const { container } = render(<ColumnSelect {...(props as any)} />, {
    useRedux: true,
  });
  expect(container.children).toHaveLength(1);
});

test('Should call "setFields" when "datasetId" changes', () => {
  const props = createProps();
  const { rerender } = render(<ColumnSelect {...(props as any)} />, {
    useRedux: true,
  });
  expect(props.form.setFields).not.toBeCalled();

  props.datasetId = 456;
  rerender(<ColumnSelect {...(props as any)} />);

  expect(props.form.setFields).toBeCalled();
});

test('Should call "getClientErrorObject" when api returns an error', async () => {
  const props = createProps();

  props.datasetId = 789;
  const spy = jest.spyOn(utils, 'getClientErrorObject');

  expect(spy).not.toBeCalled();
  render(<ColumnSelect {...(props as any)} />, {
    useRedux: true,
  });
  await waitFor(() => {
    expect(spy).toBeCalled();
  });
});
