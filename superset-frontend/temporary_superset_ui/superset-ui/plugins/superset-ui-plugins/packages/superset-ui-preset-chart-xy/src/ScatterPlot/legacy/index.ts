import { ChartPlugin } from '@superset-ui/chart';
import createMetadata from '../createMetadata';
import transformProps from './transformProps';

export default class LineChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('../../components/ScatterPlot/ScatterPlot'),
      metadata: createMetadata(true),
      transformProps,
    });
  }
}
