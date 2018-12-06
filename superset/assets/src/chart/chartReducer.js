/* eslint camelcase: 0 */
import { t } from '@superset-ui/translation';
import { now } from '../modules/dates';
import * as actions from './chartAction';

export const chart = {
  id: 0,
  chartAlert: null,
  chartStatus: 'loading',
  chartStackTrace: null,
  chartUpdateEndTime: null,
  chartUpdateStartTime: 0,
  latestQueryFormData: {},
  queryController: null,
  queryResponse: null,
  triggerQuery: true,
  lastRendered: 0,
};

export default function chartReducer(charts = {}, action) {
  const actionHandlers = {
    [actions.ADD_CHART]() {
      return {
        ...chart,
        ...action.chart,
      };
    },
    [actions.CHART_UPDATE_SUCCEEDED](state) {
      return { ...state,
        chartStatus: 'success',
        queryResponse: action.queryResponse,
        chartUpdateEndTime: now(),
      };
    },
    [actions.CHART_UPDATE_STARTED](state) {
      return {
        ...state,
        chartStatus: 'loading',
        chartStackTrace: null,
        chartAlert: null,
        chartUpdateEndTime: null,
        chartUpdateStartTime: now(),
        queryController: action.queryController,
      };
    },
    [actions.CHART_UPDATE_STOPPED](state) {
      return { ...state,
        chartStatus: 'stopped',
        chartAlert: t('Updating chart was stopped'),
        chartUpdateEndTime: now(),
      };
    },
    [actions.CHART_RENDERING_SUCCEEDED](state) {
      return { ...state,
        chartStatus: 'rendered',
      };
    },
    [actions.CHART_RENDERING_FAILED](state) {
      return { ...state,
        chartStatus: 'failed',
        chartStackTrace: action.stackTrace,
        chartAlert: t('An error occurred while rendering the visualization: %s', action.error),
      };
    },
    [actions.CHART_UPDATE_TIMEOUT](state) {
      return { ...state,
        chartStatus: 'failed',
        chartAlert: (
          `${t('Query timeout')} - ` +
          t(`visualization queries are set to timeout at ${action.timeout} seconds. `) +
          t('Perhaps your data has grown, your database is under unusual load, ' +
            'or you are simply querying a data source that is too large ' +
            'to be processed within the timeout range. ' +
            'If that is the case, we recommend that you summarize your data further.')),
        chartUpdateEndTime: now(),
      };
    },
    [actions.CHART_UPDATE_FAILED](state) {
      return { ...state,
        chartStatus: 'failed',
        chartAlert: action.queryResponse ? action.queryResponse.error : t('Network error.'),
        chartUpdateEndTime: now(),
        queryResponse: action.queryResponse,
        chartStackTrace: action.queryResponse ? action.queryResponse.stacktrace : null,
      };
    },
    [actions.TRIGGER_QUERY](state) {
      return {
        ...state,
        triggerQuery: action.value,
        chartStatus: 'loading',
      };
    },
    [actions.RENDER_TRIGGERED](state) {
      return { ...state, lastRendered: action.value };
    },
    [actions.UPDATE_QUERY_FORM_DATA](state) {
      return { ...state, latestQueryFormData: action.value };
    },
    [actions.ANNOTATION_QUERY_STARTED](state) {
      if (state.annotationQuery &&
        state.annotationQuery[action.annotation.name]) {
        state.annotationQuery[action.annotation.name].abort();
      }
      const annotationQuery = {
        ...state.annotationQuery,
        [action.annotation.name]: action.queryRequest,
      };
      return {
        ...state,
        annotationQuery,
      };
    },
    [actions.ANNOTATION_QUERY_SUCCESS](state) {
      const annotationData = {
        ...state.annotationData,
        [action.annotation.name]: action.queryResponse.data,
      };
      const annotationError = { ...state.annotationError };
      delete annotationError[action.annotation.name];
      const annotationQuery = { ...state.annotationQuery };
      delete annotationQuery[action.annotation.name];
      return {
        ...state,
        annotationData,
        annotationError,
        annotationQuery,
      };
    },
    [actions.ANNOTATION_QUERY_FAILED](state) {
      const annotationData = { ...state.annotationData };
      delete annotationData[action.annotation.name];
      const annotationError = {
        ...state.annotationError,
        [action.annotation.name]: action.queryResponse ?
          action.queryResponse.error : t('Network error.'),
      };
      const annotationQuery = { ...state.annotationQuery };
      delete annotationQuery[action.annotation.name];
      return {
        ...state,
        annotationData,
        annotationError,
        annotationQuery,
      };
    },
    [actions.SQLLAB_REDIRECT_FAILED](state) {
      return { ...state,
        chartStatus: 'failed',
        chartAlert: t('An error occurred while redirecting to SQL Lab: %s', action.error),
      };
    },
  };

  /* eslint-disable no-param-reassign */
  if (action.type === actions.REMOVE_CHART) {
    delete charts[action.key];
    return charts;
  }

  if (action.type in actionHandlers) {
    return {
      ...charts,
      [action.key]: actionHandlers[action.type](charts[action.key], action),
    };
  }

  return charts;
}
