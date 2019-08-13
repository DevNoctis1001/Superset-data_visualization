/* eslint-disable no-magic-numbers */
import React from 'react';
import { SuperChart } from '@superset-ui/chart';
import dataLegacy from './dataLegacy';
import data from './data';

export default [
  {
    renderStory: () => (
      <SuperChart
        chartType="table2-legacy"
        key="table1"
        datasource={{
          columnFormats: {},
          verboseMap: {
            name: 'name',
            sum__num: 'sum__num',
          },
        }}
        formData={{
          alignPn: false,
          colorPn: true,
          includeSearch: false,
          metrics: ['sum__num', 'trend'],
          orderDesc: true,
          pageLength: 0,
          percentMetrics: ['sum__num'],
          tableFilter: false,
          tableTimestampFormat: '%Y-%m-%d %H:%M:%S',
          timeseriesLimitMetric: 'trend',
        }}
        payload={{ data: dataLegacy }}
      />
    ),
    storyName: 'Legacy',
    storyPath: 'plugin-chart-table|TableChartPlugin',
  },
  {
    renderStory: () => (
      <SuperChart
        chartType="table2-legacy"
        key="table2"
        datasource={{
          columnFormats: {},
          verboseMap: {
            name: 'name',
            sum__num: 'sum__num',
          },
        }}
        formData={{
          alignPn: false,
          colorPn: true,
          includeSearch: true,
          metrics: ['sum__num', 'trend'],
          orderDesc: true,
          pageLength: 0,
          percentMetrics: [],
          tableFilter: true,
          tableTimestampFormat: '%Y-%m-%d %H:%M:%S',
          timeseriesLimitMetric: 'trend',
        }}
        payload={{ data: dataLegacy }}
      />
    ),
    storyName: 'Legacy-TableFilter',
    storyPath: 'plugin-chart-table|TableChartPlugin',
  },
  {
    renderStory: () => (
      <SuperChart
        chartType="table2"
        key="table3"
        datasource={{
          columnFormats: {},
          verboseMap: {
            name: 'name',
            sum__num: 'sum__num',
          },
        }}
        formData={{
          alignPn: true,
          colorPn: true,
          includeSearch: true,
          metrics: ['sum__num'],
          orderDesc: true,
          pageLength: 0,
          percentMetrics: ['sum__num'],
          tableFilter: true,
          tableTimestampFormat: '%Y-%m-%d %H:%M:%S',
          timeseriesLimitMetric: null,
        }}
        payload={{ data }}
      />
    ),
    storyName: 'TableFilter',
    storyPath: 'plugin-chart-table|TableChartPlugin',
  },
];
