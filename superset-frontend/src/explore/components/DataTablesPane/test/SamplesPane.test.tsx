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
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import {
  render,
  waitForElementToBeRemoved,
} from 'spec/helpers/testing-library';
import { exploreActions } from 'src/explore/actions/exploreActions';
import { promiseTimeout } from '@superset-ui/core';
import { SamplesPane } from '../components';
import { createSamplesPaneProps } from './fixture';

describe('SamplesPane', () => {
  fetchMock.get('end:/api/v1/dataset/34/samples?force=false', {
    result: {
      data: [],
      colnames: [],
      coltypes: [],
    },
  });

  fetchMock.get('end:/api/v1/dataset/35/samples?force=true', {
    result: {
      data: [
        { __timestamp: 1230768000000, genre: 'Action' },
        { __timestamp: 1230768000010, genre: 'Horror' },
      ],
      colnames: ['__timestamp', 'genre'],
      coltypes: [2, 1],
    },
  });

  fetchMock.get('end:/api/v1/dataset/36/samples?force=false', 400);

  const setForceQuery = jest.spyOn(exploreActions, 'setForceQuery');

  afterAll(() => {
    fetchMock.reset();
    jest.resetAllMocks();
  });

  test('render', async () => {
    const props = createSamplesPaneProps({ datasourceId: 34 });
    const { findByText } = render(<SamplesPane {...props} />);
    expect(
      await findByText('No samples were returned for this dataset'),
    ).toBeVisible();
    await promiseTimeout(() => {
      expect(setForceQuery).toHaveBeenCalledTimes(0);
    }, 10);
  });

  test('error response', async () => {
    const props = createSamplesPaneProps({
      datasourceId: 36,
    });
    const { findByText } = render(<SamplesPane {...props} />, {
      useRedux: true,
    });

    expect(await findByText('Error: Bad Request')).toBeVisible();
  });

  test('force query, render and search', async () => {
    const props = createSamplesPaneProps({
      datasourceId: 35,
      queryForce: true,
    });
    const { queryByText, getByPlaceholderText } = render(
      <SamplesPane {...props} />,
      {
        useRedux: true,
      },
    );

    await promiseTimeout(() => {
      expect(setForceQuery).toHaveBeenCalledTimes(1);
    }, 10);
    expect(queryByText('2 rows')).toBeVisible();
    expect(queryByText('Action')).toBeVisible();
    expect(queryByText('Horror')).toBeVisible();

    userEvent.type(getByPlaceholderText('Search'), 'hor');
    await waitForElementToBeRemoved(() => queryByText('Action'));
    expect(queryByText('Horror')).toBeVisible();
    expect(queryByText('Action')).not.toBeInTheDocument();
  });
});
