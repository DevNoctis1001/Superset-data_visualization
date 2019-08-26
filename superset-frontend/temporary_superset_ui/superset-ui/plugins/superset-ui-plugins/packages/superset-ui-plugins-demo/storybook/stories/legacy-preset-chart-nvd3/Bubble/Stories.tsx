/* eslint-disable no-magic-numbers */
import React from 'react';
import { SuperChart } from '@superset-ui/chart';
import data from './data';
import dummyDatasource from '../../../shared/dummyDatasource';

export default [
  {
    renderStory: () => (
      <SuperChart
        chartType="bubble"
        width={400}
        height={400}
        datasource={dummyDatasource}
        queryData={{ data }}
        formData={{
          annotationData: {},
          bottomMargin: 'auto',
          colorScheme: 'd3Category10',
          entity: 'country_name',
          leftMargin: 'auto',
          maxBubbleSize: '50',
          series: 'region',
          showLegend: true,
          size: 'sum__SP_POP_TOTL',
          vizType: 'bubble',
          x: 'sum__SP_RUR_TOTL_ZS',
          xAxisFormat: '.3s',
          xAxisLabel: 'x-axis label',
          xAxisShowminmax: false,
          xLogScale: false,
          xTicksLayout: 'auto',
          y: 'sum__SP_DYN_LE00_IN',
          yAxisFormat: '.3s',
          yAxisLabel: '',
          yAxisShowminmax: false,
          yLogScale: false,
        }}
      />
    ),
    storyName: 'Basic',
    storyPath: 'legacy-|preset-chart-nvd3|BubbleChartPlugin',
  },
];
