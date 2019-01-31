/* eslint-disable no-magic-numbers */
import React from 'react';
import { SuperChart } from '@superset-ui/chart';

export default [
  {
    renderStory: () => (
      <SuperChart
        chartType="sunburst"
        chartProps={{
          formData: {
            colorScheme: 'd3Category10',
            metric: 'sum__SP_POP_TOTL',
            secondaryMetric: 'sum__SP_RUR_TOTL',
          },
          height: 400,
          payload: {
            data: [
              ['East Asia & Pacific', 'China', 1344130000.0, 664363135.0],
              ['South Asia', 'India', 1247446011.0, 857294797.0],
              ['North America', 'United States', 311721632.0, 59414143.0],
              ['East Asia & Pacific', 'Indonesia', 244808254.0, 120661092.0],
              ['Latin America & Caribbean', 'Brazil', 200517584.0, 30833589.0],
              ['South Asia', 'Pakistan', 173669648.0, 109399721.0],
              ['Sub-Saharan Africa', 'Nigeria', 163770669.0, 91118725.0],
              ['South Asia', 'Bangladesh', 153405612.0, 105504710.0],
              ['Europe & Central Asia', 'Russian Federation', 142960868.0, 37552961.0],
              ['East Asia & Pacific', 'Japan', 127817277.0, 11186568.0],
            ],
          },
          width: 400,
        }}
      />
    ),
    storyName: 'SunburstChartPlugin',
    storyPath: 'plugin-chart-sunburst',
  },
];
