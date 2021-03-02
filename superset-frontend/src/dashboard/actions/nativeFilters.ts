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

import { makeApi, DataMask } from '@superset-ui/core';
import { Dispatch } from 'redux';
import { FilterConfiguration } from 'src/dashboard/components/nativeFilters/types';
import { dashboardInfoChanged } from './dashboardInfo';
import {
  FiltersState,
  FilterState,
  FiltersSet,
  FilterStateType,
} from '../reducers/types';

export const SET_FILTER_CONFIG_BEGIN = 'SET_FILTER_CONFIG_BEGIN';
export interface SetFilterConfigBegin {
  type: typeof SET_FILTER_CONFIG_BEGIN;
  filterConfig: FilterConfiguration;
}
export const SET_FILTER_CONFIG_COMPLETE = 'SET_FILTER_CONFIG_COMPLETE';
export interface SetFilterConfigComplete {
  type: typeof SET_FILTER_CONFIG_COMPLETE;
  filterConfig: FilterConfiguration;
}
export const SET_FILTER_CONFIG_FAIL = 'SET_FILTER_CONFIG_FAIL';
export interface SetFilterConfigFail {
  type: typeof SET_FILTER_CONFIG_FAIL;
  filterConfig: FilterConfiguration;
}
export const SET_FILTER_SETS_CONFIG_BEGIN = 'SET_FILTER_SETS_CONFIG_BEGIN';
export interface SetFilterSetsConfigBegin {
  type: typeof SET_FILTER_SETS_CONFIG_BEGIN;
  filterSetsConfig: FiltersSet[];
}
export const SET_FILTER_SETS_CONFIG_COMPLETE =
  'SET_FILTER_SETS_CONFIG_COMPLETE';
export interface SetFilterSetsConfigComplete {
  type: typeof SET_FILTER_SETS_CONFIG_COMPLETE;
  filterSetsConfig: FiltersSet[];
}
export const SET_FILTER_SETS_CONFIG_FAIL = 'SET_FILTER_SETS_CONFIG_FAIL';
export interface SetFilterSetsConfigFail {
  type: typeof SET_FILTER_SETS_CONFIG_FAIL;
  filterSetsConfig: FiltersSet[];
}

interface DashboardInfo {
  id: number;
  json_metadata: string;
}

export const setFilterConfiguration = (
  filterConfig: FilterConfiguration,
) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({
    type: SET_FILTER_CONFIG_BEGIN,
    filterConfig,
  });
  const { id, metadata } = getState().dashboardInfo;

  // TODO extract this out when makeApi supports url parameters
  const updateDashboard = makeApi<
    Partial<DashboardInfo>,
    { result: DashboardInfo }
  >({
    method: 'PUT',
    endpoint: `/api/v1/dashboard/${id}`,
  });

  try {
    const response = await updateDashboard({
      json_metadata: JSON.stringify({
        ...metadata,
        filter_configuration: filterConfig,
      }),
    });
    dispatch(
      dashboardInfoChanged({
        metadata: JSON.parse(response.result.json_metadata),
      }),
    );
    dispatch({
      type: SET_FILTER_CONFIG_COMPLETE,
      filterConfig,
    });
  } catch (err) {
    dispatch({ type: SET_FILTER_CONFIG_FAIL, filterConfig });
  }
};

export const setFilterSetsConfiguration = (
  filterSetsConfig: FiltersSet[],
) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({
    type: SET_FILTER_SETS_CONFIG_BEGIN,
    filterSetsConfig,
  });
  const { id, metadata } = getState().dashboardInfo;

  // TODO extract this out when makeApi supports url parameters
  const updateDashboard = makeApi<
    Partial<DashboardInfo>,
    { result: DashboardInfo }
  >({
    method: 'PUT',
    endpoint: `/api/v1/dashboard/${id}`,
  });

  try {
    const response = await updateDashboard({
      json_metadata: JSON.stringify({
        ...metadata,
        filter_sets_configuration: filterSetsConfig,
      }),
    });
    dispatch(
      dashboardInfoChanged({
        metadata: JSON.parse(response.result.json_metadata),
      }),
    );
    dispatch({
      type: SET_FILTER_SETS_CONFIG_COMPLETE,
      filterSetsConfig,
    });
  } catch (err) {
    dispatch({ type: SET_FILTER_SETS_CONFIG_FAIL, filterSetsConfig });
  }
};

export const UPDATE_EXTRA_FORM_DATA = 'UPDATE_EXTRA_FORM_DATA';
export interface UpdateExtraFormData {
  type: typeof UPDATE_EXTRA_FORM_DATA;
  filterId: string;
  nativeFilters?: Omit<FilterState, 'id'>;
  crossFilters?: Omit<FilterState, 'id'>;
  ownFilters?: Omit<FilterState, 'id'>;
}

export const SAVE_FILTER_SETS = 'SAVE_FILTER_SETS';
export interface SaveFilterSets {
  type: typeof SAVE_FILTER_SETS;
  name: string;
  filtersState: Pick<FiltersState, FilterStateType.NativeFilters>;
  filtersSetId: string;
}

export const SET_FILTERS_STATE = 'SET_FILTERS_STATE';
export interface SetFiltersState {
  type: typeof SET_FILTERS_STATE;
  filtersState: FiltersState;
}

/**
 * Sets the selected option(s) for a given filter
 * @param filterId the id of the nativeFilters filter
 * @param filterState
 */
export function updateExtraFormData(
  filterId: string,
  filterState: DataMask,
): UpdateExtraFormData {
  return {
    type: UPDATE_EXTRA_FORM_DATA,
    filterId,
    ...filterState,
  };
}

export function saveFilterSets(
  name: string,
  filtersSetId: string,
  filtersState: Pick<FiltersState, FilterStateType.NativeFilters>,
): SaveFilterSets {
  return {
    type: SAVE_FILTER_SETS,
    name,
    filtersSetId,
    filtersState,
  };
}

export function setFiltersState(filtersState: FiltersState): SetFiltersState {
  return {
    type: SET_FILTERS_STATE,
    filtersState,
  };
}

export type AnyFilterAction =
  | SetFilterConfigBegin
  | SetFilterConfigComplete
  | SetFilterConfigFail
  | SetFilterSetsConfigBegin
  | SetFilterSetsConfigComplete
  | SetFilterSetsConfigFail
  | SetFiltersState
  | SaveFilterSets
  | UpdateExtraFormData;
