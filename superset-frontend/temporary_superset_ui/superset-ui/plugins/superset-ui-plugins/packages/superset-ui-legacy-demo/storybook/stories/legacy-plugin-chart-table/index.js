import TableChartPlugin from '../../../../superset-ui-legacy-plugin-chart-table/src/index';
import Stories from './Stories';

new TableChartPlugin().configure({ key: 'table' }).register();

export default {
  examples: [...Stories],
};
