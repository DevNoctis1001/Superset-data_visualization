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
import {
  QueryData,
  QueryFormData,
  AnnotationData,
  AdhocMetric,
  JsonObject,
} from '@superset-ui/core';
import {
  ColumnMeta,
  Dataset,
  ControlStateMapping,
} from '@superset-ui/chart-controls';
import { DatabaseObject } from 'src/views/CRUD/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import { toastState } from 'src/SqlLab/types';
import { Slice } from 'src/types/Chart';

export { Slice, Chart } from 'src/types/Chart';

export type ChartStatus =
  | 'loading'
  | 'rendered'
  | 'failed'
  | 'stopped'
  | 'success';

export interface ChartState {
  id: number;
  annotationData?: AnnotationData;
  annotationError?: Record<string, string>;
  annotationQuery?: Record<string, AbortController>;
  chartAlert: string | null;
  chartStatus: ChartStatus | null;
  chartStackTrace?: string | null;
  chartUpdateEndTime: number | null;
  chartUpdateStartTime: number;
  lastRendered: number;
  latestQueryFormData: Partial<QueryFormData>;
  sliceFormData: QueryFormData | null;
  queryController: AbortController | null;
  queriesResponse: QueryData | null;
  triggerQuery: boolean;
}

export type OptionSortType = Partial<
  ColumnMeta & AdhocMetric & { saved_metric_name: string }
>;

export type Datasource = Dataset & {
  database?: DatabaseObject;
  datasource?: string;
  schema?: string;
  is_sqllab_view?: boolean;
};

export type ExploreRootState = {
  explore: {
    can_add: boolean;
    can_download: boolean;
    common: object;
    controls: object;
    controlsTransferred: object;
    datasource: object;
    datasource_id: number;
    datasource_type: string;
    force: boolean;
    forced_height: object;
    form_data: object;
    isDatasourceMetaLoading: boolean;
    isStarred: boolean;
    slice: object;
    sliceName: string;
    standalone: boolean;
    timeFormattedColumns: object;
    user: UserWithPermissionsAndRoles;
  };
  localStorageUsageInKilobytes: number;
  messageToasts: toastState[];
  common: {};
};

export interface ExplorePageInitialData {
  dataset: Dataset;
  form_data: QueryFormData;
  slice: Slice | null;
}

export interface ExploreResponsePayload {
  result: ExplorePageInitialData & { message: string };
}

export interface ExplorePageState {
  user: UserWithPermissionsAndRoles;
  common: {
    flash_messages: string[];
    conf: JsonObject;
    locale: string;
  };
  charts: { [key: number]: ChartState };
  datasources: { [key: string]: Dataset };
  explore: {
    can_add: boolean;
    can_download: boolean;
    can_overwrite: boolean;
    isDatasourceMetaLoading: boolean;
    isStarred: boolean;
    triggerRender: boolean;
    // duplicate datasource in exploreState - it's needed by getControlsState
    datasource: Dataset;
    controls: ControlStateMapping;
    form_data: QueryFormData;
    slice: Slice;
    controlsTransferred: string[];
    standalone: boolean;
    force: boolean;
  };
  sliceEntities?: JsonObject; // propagated from Dashboard view
}
