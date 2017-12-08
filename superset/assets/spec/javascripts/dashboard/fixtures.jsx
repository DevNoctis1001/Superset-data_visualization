import { getInitialState } from '../../../javascripts/dashboard/reducers';

export const defaultFilters = {
  256: {
    region: [],
    country_name: ['United States'],
  },
};
export const regionFilter = {
  datasource: null,
  description: null,
  description_markeddown: '',
  edit_url: '/slicemodelview/edit/256',
  form_data: {
    datasource: '2__table',
    date_filter: false,
    filters: [{
      col: 'country_name',
      op: 'in',
      val: ['United States', 'France', 'Japan'],
    }],
    granularity_sqla: null,
    groupby: ['region', 'country_name'],
    having: '',
    instant_filtering: true,
    metric: 'sum__SP_POP_TOTL',
    show_druid_time_granularity: false,
    show_druid_time_origin: false,
    show_sqla_time_column: false,
    show_sqla_time_granularity: false,
    since: '100 years ago',
    slice_id: 256,
    time_grain_sqla: null,
    until: 'now',
    viz_type: 'filter_box',
    where: '',
  },
  slice_id: 256,
  slice_name: 'Region Filters',
  slice_url: '/superset/explore/table/2/?form_data=%7B%22slice_id%22%3A%20256%7D',
};
export const slice = {
  datasource: null,
  description: null,
  description_markeddown: '',
  edit_url: '/slicemodelview/edit/248',
  form_data: {
    annotation_layers: [],
    bottom_margin: 'auto',
    color_scheme: 'bnbColors',
    contribution: false,
    datasource: '2__table',
    filters: [],
    granularity_sqla: null,
    groupby: [],
    having: '',
    left_margin: 'auto',
    limit: 50,
    line_interpolation: 'linear',
    metrics: ['sum__SP_POP_TOTL'],
    num_period_compare: '',
    order_desc: true,
    period_ratio_type: 'growth',
    resample_fillmethod: null,
    resample_how: null,
    resample_rule: null,
    rich_tooltip: true,
    rolling_type: 'None',
    show_brush: false,
    show_legend: true,
    show_markers: false,
    since: '1961-01-01T00:00:00',
    slice_id: 248,
    time_compare: null,
    time_grain_sqla: null,
    timeseries_limit_metric: null,
    until: '2014-12-31T00:00:00',
    viz_type: 'line',
    where: '',
    x_axis_format: 'smart_date',
    x_axis_label: '',
    x_axis_showminmax: true,
    y_axis_bounds: [null, null],
    y_axis_format: '.3s',
    y_axis_label: '',
    y_axis_showminmax: true,
    y_log_scale: false,
  },
  slice_id: 248,
  slice_name: 'Filtered Population',
  slice_url: '/superset/explore/table/2/?form_data=%7B%22slice_id%22%3A%20248%7D',
};

const datasources = {};
const mockDashboardData = {
  css: '',
  dash_edit_perm: true,
  dash_save_perm: true,
  dashboard_title: 'Births',
  id: 2,
  metadata: {
    default_filters: JSON.stringify(defaultFilters),
    filter_immune_slices: [],
    timed_refresh_immune_slices: [],
    filter_immune_slice_fields: {},
    expanded_slices: {},
  },
  position_json: [
    {
      size_x: 4,
      slice_id: '256',
      row: 0,
      size_y: 4,
      col: 5,
    },
    {
      size_x: 4,
      slice_id: '248',
      row: 0,
      size_y: 4,
      col: 1,
    },
  ],
  slug: 'births',
  slices: [regionFilter, slice],
  standalone_mode: false,
};
export const { dashboard, charts } = getInitialState({
  common: {},
  dashboard_data: mockDashboardData,
  datasources,
  user_id: '1',
});

