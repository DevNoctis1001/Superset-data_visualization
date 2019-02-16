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
import { shallow } from 'enzyme';
import sinon from 'sinon';

import Chart from '../../../../../src/dashboard/components/gridComponents/Chart';
import SliceHeader from '../../../../../src/dashboard/components/SliceHeader';
import ChartContainer from '../../../../../src/chart/ChartContainer';

import mockDatasource from '../../../../fixtures/mockDatasource';
import {
  sliceEntitiesForChart as sliceEntities,
  sliceId,
} from '../../fixtures/mockSliceEntities';
import chartQueries, {
  sliceId as queryId,
} from '../../fixtures/mockChartQueries';

describe('Chart', () => {
  const props = {
    id: sliceId,
    width: 100,
    height: 100,
    updateSliceName() {},

    // from redux
    chart: chartQueries[queryId],
    formData: chartQueries[queryId].formData,
    datasource: mockDatasource[sliceEntities.slices[sliceId].datasource],
    slice: {
      ...sliceEntities.slices[sliceId],
      description_markeddown: 'markdown',
    },
    sliceName: sliceEntities.slices[sliceId].slice_name,
    timeout: 60,
    filters: {},
    refreshChart() {},
    toggleExpandSlice() {},
    addFilter() {},
    logEvent() {},
    editMode: false,
    isExpanded: false,
    supersetCanExplore: false,
    sliceCanEdit: false,
  };

  function setup(overrideProps) {
    const wrapper = shallow(<Chart {...props} {...overrideProps} />);
    return wrapper;
  }

  it('should render a SliceHeader', () => {
    const wrapper = setup();
    expect(wrapper.find(SliceHeader)).toHaveLength(1);
  });

  it('should render a ChartContainer', () => {
    const wrapper = setup();
    expect(wrapper.find(ChartContainer)).toHaveLength(1);
  });

  it('should render a description if it has one and isExpanded=true', () => {
    const wrapper = setup();
    expect(wrapper.find('.slice_description')).toHaveLength(0);

    wrapper.setProps({ ...props, isExpanded: true });
    expect(wrapper.find('.slice_description')).toHaveLength(1);
  });

  it('should call refreshChart when SliceHeader calls forceRefresh', () => {
    const refreshChart = sinon.spy();
    const wrapper = setup({ refreshChart });
    wrapper.instance().forceRefresh();
    expect(refreshChart.callCount).toBe(1);
  });

  it('should call addFilter when ChartContainer calls addFilter', () => {
    const addFilter = sinon.spy();
    const wrapper = setup({ addFilter });
    wrapper.instance().addFilter();
    expect(addFilter.callCount).toBe(1);
  });
});
