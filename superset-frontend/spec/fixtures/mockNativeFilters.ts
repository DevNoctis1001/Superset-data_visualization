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
import { ExtraFormData } from '@superset-ui/core';
import { NativeFilterType } from 'src/dashboard/components/nativeFilters/types';
import { NativeFiltersState } from 'src/dashboard/reducers/types';
import { DataMaskStateWithId } from '../../src/dataMask/types';

export const nativeFilters: NativeFiltersState = {
  filterSets: {},
  filters: {
    'NATIVE_FILTER-e7Q8zKixx': {
      id: 'NATIVE_FILTER-e7Q8zKixx',
      name: 'region',
      filterType: 'filter_select',
      targets: [
        {
          datasetId: 2,
          column: {
            name: 'region',
          },
        },
      ],
      defaultDataMask: {
        filterState: {
          value: null,
        },
      },
      cascadeParentIds: [],
      scope: {
        rootPath: ['ROOT_ID'],
        excluded: [],
      },
      controlValues: {
        multiSelect: false,
        enableEmptyFilter: false,
        inverseSelection: false,
      },
      type: NativeFilterType.NATIVE_FILTER,
    },
    'NATIVE_FILTER-x9QPw0so1': {
      id: 'NATIVE_FILTER-x9QPw0so1',
      name: 'country_code',
      filterType: 'filter_select',
      targets: [
        {
          datasetId: 2,
          column: {
            name: 'country_code',
          },
        },
      ],
      defaultDataMask: {
        filterState: {
          value: null,
        },
      },
      cascadeParentIds: [],
      scope: {
        rootPath: ['ROOT_ID'],
        excluded: [],
      },
      controlValues: {
        multiSelect: false,
        enableEmptyFilter: false,
        inverseSelection: false,
      },
      type: NativeFilterType.NATIVE_FILTER,
    },
  },
};

export const dataMaskWith2Filters: DataMaskStateWithId = {
  'NATIVE_FILTER-e7Q8zKixx': {
    id: 'NATIVE_FILTER-e7Q8zKixx',
    ownState: {},
    extraFormData: {
      filters: [
        {
          col: 'region',
          op: 'IN',
          val: ['East Asia & Pacific'],
        },
      ],
    },
    filterState: {
      value: ['East Asia & Pacific'],
    },
  },
  'NATIVE_FILTER-x9QPw0so1': {
    id: 'NATIVE_FILTER-x9QPw0so1',
    ownState: {},
    extraFormData: {},
    filterState: {},
  },
};

export const extraFormData: ExtraFormData = {
  filters: [
    {
      col: 'ethnic_minority',
      op: 'IN',
      val: ['No, not an ethnic minority'],
    },
  ],
};

export const NATIVE_FILTER_ID = 'NATIVE_FILTER-p4LImrSgA';

export const singleNativeFiltersState = {
  filters: {
    [NATIVE_FILTER_ID]: {
      id: [NATIVE_FILTER_ID],
      name: 'eth',
      type: 'text',
      targets: [{ datasetId: 13, column: { name: 'ethnic_minority' } }],
      defaultDataMask: {
        filterState: {
          value: null,
        },
      },
      cascadeParentIds: [],
      scope: { rootPath: ['ROOT_ID'], excluded: [227, 229] },
      inverseSelection: false,
      allowsMultipleValues: false,
      isRequired: false,
    },
  },
};

export const dataMaskWith1Filter: DataMaskStateWithId = {
  [NATIVE_FILTER_ID]: {
    id: NATIVE_FILTER_ID,
    extraFormData,
    filterState: {
      value: ['No, not an ethnic minority'],
    },
  },
};

export const layoutForSingleNativeFilter = {
  'CHART-ZHVS7YasaQ': {
    children: [],
    id: 'CHART-ZHVS7YasaQ',
    meta: {
      chartId: 230,
      height: 50,
      sliceName: 'Pie Chart',
      uuid: '05ef6145-3950-4f59-891f-160852613eca',
      width: 12,
    },
    parents: ['ROOT_ID', 'GRID_ID', 'ROW-NweUz7oC0'],
    type: 'CHART',
  },
  'CHART-gsGu8NIKQT': {
    children: [],
    id: 'CHART-gsGu8NIKQT',
    meta: {
      chartId: 227,
      height: 50,
      sliceName: 'Another Chart',
      uuid: 'ddb78f6c-7876-47fc-ae98-70183b05ba90',
      width: 4,
    },
    parents: ['ROOT_ID', 'GRID_ID', 'ROW-QkiTjeZGs'],
    type: 'CHART',
  },
  'CHART-hgYjD8axJX': {
    children: [],
    id: 'CHART-hgYjD8axJX',
    meta: {
      chartId: 229,
      height: 47,
      sliceName: 'Bar Chart',
      uuid: 'e1501e54-d632-4fdc-ae16-07cafee31093',
      width: 12,
    },
    parents: ['ROOT_ID', 'GRID_ID', 'ROW-mcdVZi0rL'],
    type: 'CHART',
  },
  DASHBOARD_VERSION_KEY: 'v2',
  GRID_ID: {
    children: ['ROW-mcdVZi0rL', 'ROW-NweUz7oC0', 'ROW-QkiTjeZGs'],
    id: 'GRID_ID',
    parents: ['ROOT_ID'],
    type: 'GRID',
  },
  HEADER_ID: {
    id: 'HEADER_ID',
    type: 'HEADER',
    meta: { text: 'My Native Filter Dashboard' },
  },
  ROOT_ID: { children: ['GRID_ID'], id: 'ROOT_ID', type: 'ROOT' },
  'ROW-NweUz7oC0': {
    children: ['CHART-ZHVS7YasaQ'],
    id: 'ROW-NweUz7oC0',
    meta: { background: 'BACKGROUND_TRANSPARENT' },
    parents: ['ROOT_ID', 'GRID_ID'],
    type: 'ROW',
  },
  'ROW-QkiTjeZGs': {
    children: ['CHART-gsGu8NIKQT'],
    id: 'ROW-QkiTjeZGs',
    meta: { background: 'BACKGROUND_TRANSPARENT' },
    parents: ['ROOT_ID', 'GRID_ID'],
    type: 'ROW',
  },
  'ROW-mcdVZi0rL': {
    children: ['CHART-hgYjD8axJX'],
    id: 'ROW-mcdVZi0rL',
    meta: { '0': 'ROOT_ID', background: 'BACKGROUND_TRANSPARENT' },
    parents: ['ROOT_ID', 'GRID_ID'],
    type: 'ROW',
  },
};

export const mockQueryDataForCountries = [
  { country_name: 'Afghanistan', 'SUM(SP_POP_TOTL)': 887557752 },
  { country_name: 'Albania', 'SUM(SP_POP_TOTL)': 148154320 },
  { country_name: 'Algeria', 'SUM(SP_POP_TOTL)': 1317290647 },
  { country_name: 'American Samoa', 'SUM(SP_POP_TOTL)': 2294886 },
  { country_name: 'Andorra', 'SUM(SP_POP_TOTL)': 2704725 },
  { country_name: 'Angola', 'SUM(SP_POP_TOTL)': 641906296 },
  { country_name: 'Antigua and Barbuda', 'SUM(SP_POP_TOTL)': 3887170 },
  { country_name: 'Argentina', 'SUM(SP_POP_TOTL)': 1728332290 },
  { country_name: 'Armenia', 'SUM(SP_POP_TOTL)': 160782905 },
  { country_name: 'Aruba', 'SUM(SP_POP_TOTL)': 4048374 },
  { country_name: 'Australia', 'SUM(SP_POP_TOTL)': 903260509 },
  { country_name: 'Austria', 'SUM(SP_POP_TOTL)': 426785647 },
  { country_name: 'Azerbaijan', 'SUM(SP_POP_TOTL)': 374210660 },
  { country_name: 'Bahamas, The', 'SUM(SP_POP_TOTL)': 13446111 },
  { country_name: 'Bahrain', 'SUM(SP_POP_TOTL)': 29724096 },
  { country_name: 'Bangladesh', 'SUM(SP_POP_TOTL)': 5549261462 },
  { country_name: 'Barbados', 'SUM(SP_POP_TOTL)': 14146501 },
  { country_name: 'Belarus', 'SUM(SP_POP_TOTL)': 524490000 },
  { country_name: 'Belgium', 'SUM(SP_POP_TOTL)': 551921585 },
  { country_name: 'Belize', 'SUM(SP_POP_TOTL)': 10571460 },
  { country_name: 'Benin', 'SUM(SP_POP_TOTL)': 290736360 },
  { country_name: 'Bermuda', 'SUM(SP_POP_TOTL)': 3159267 },
  { country_name: 'Bhutan', 'SUM(SP_POP_TOTL)': 25987074 },
  { country_name: 'Bolivia', 'SUM(SP_POP_TOTL)': 368308373 },
  { country_name: 'Bosnia and Herzegovina', 'SUM(SP_POP_TOTL)': 215521543 },
  { country_name: 'Botswana', 'SUM(SP_POP_TOTL)': 70510085 },
  { country_name: 'Brazil', 'SUM(SP_POP_TOTL)': 7752058955 },
  { country_name: 'Brunei Darussalam', 'SUM(SP_POP_TOTL)': 13322318 },
  { country_name: 'Bulgaria', 'SUM(SP_POP_TOTL)': 456247765 },
  { country_name: 'Burkina Faso', 'SUM(SP_POP_TOTL)': 505122912 },
  { country_name: 'Burundi', 'SUM(SP_POP_TOTL)': 305731834 },
  { country_name: 'Cabo Verde', 'SUM(SP_POP_TOTL)': 19178461 },
  { country_name: 'Cambodia', 'SUM(SP_POP_TOTL)': 523555378 },
  { country_name: 'Cameroon', 'SUM(SP_POP_TOTL)': 664127790 },
  { country_name: 'Canada', 'SUM(SP_POP_TOTL)': 1470276931 },
  { country_name: 'Cayman Islands', 'SUM(SP_POP_TOTL)': 1480956 },
  { country_name: 'Central African Republic', 'SUM(SP_POP_TOTL)': 158650217 },
  { country_name: 'Chad', 'SUM(SP_POP_TOTL)': 355875809 },
  { country_name: 'Channel Islands', 'SUM(SP_POP_TOTL)': 7515697 },
  { country_name: 'Chile', 'SUM(SP_POP_TOTL)': 696739897 },
  { country_name: 'China', 'SUM(SP_POP_TOTL)': 58345455000 },
  { country_name: 'Colombia', 'SUM(SP_POP_TOTL)': 1776189608 },
  { country_name: 'Comoros', 'SUM(SP_POP_TOTL)': 22692936 },
  { country_name: 'Congo, Dem. Rep.', 'SUM(SP_POP_TOTL)': 2015439254 },
  { country_name: 'Congo, Rep.', 'SUM(SP_POP_TOTL)': 130701144 },
  { country_name: 'Costa Rica', 'SUM(SP_POP_TOTL)': 163515714 },
  { country_name: "Cote d'Ivoire", 'SUM(SP_POP_TOTL)': 634194484 },
  { country_name: 'Croatia', 'SUM(SP_POP_TOTL)': 246197511 },
  { country_name: 'Cuba', 'SUM(SP_POP_TOTL)': 550461345 },
  { country_name: 'Curacao', 'SUM(SP_POP_TOTL)': 7898637 },
  { country_name: 'Cyprus', 'SUM(SP_POP_TOTL)': 43711039 },
  { country_name: 'Czech Republic', 'SUM(SP_POP_TOTL)': 559416359 },
  { country_name: 'Denmark', 'SUM(SP_POP_TOTL)': 283435789 },
  { country_name: 'Djibouti', 'SUM(SP_POP_TOTL)': 26324244 },
  { country_name: 'Dominica', 'SUM(SP_POP_TOTL)': 3881071 },
  { country_name: 'Dominican Republic', 'SUM(SP_POP_TOTL)': 373939753 },
  { country_name: 'Ecuador', 'SUM(SP_POP_TOTL)': 537148542 },
  { country_name: 'Egypt, Arab Rep.', 'SUM(SP_POP_TOTL)': 2967887581 },
  { country_name: 'El Salvador', 'SUM(SP_POP_TOTL)': 266413287 },
  { country_name: 'Equatorial Guinea', 'SUM(SP_POP_TOTL)': 22627794 },
  { country_name: 'Eritrea', 'SUM(SP_POP_TOTL)': 161125877 },
  { country_name: 'Estonia', 'SUM(SP_POP_TOTL)': 77119567 },
  { country_name: 'Ethiopia', 'SUM(SP_POP_TOTL)': 2750952916 },
  { country_name: 'Faeroe Islands', 'SUM(SP_POP_TOTL)': 2399439 },
  { country_name: 'Fiji', 'SUM(SP_POP_TOTL)': 37505227 },
  { country_name: 'Finland', 'SUM(SP_POP_TOTL)': 271585488 },
  { country_name: 'France', 'SUM(SP_POP_TOTL)': 3151638853 },
  { country_name: 'French Polynesia', 'SUM(SP_POP_TOTL)': 9974982 },
  { country_name: 'Gabon', 'SUM(SP_POP_TOTL)': 52489952 },
  { country_name: 'Gambia, The', 'SUM(SP_POP_TOTL)': 50232086 },
  { country_name: 'Georgia', 'SUM(SP_POP_TOTL)': 241070850 },
  { country_name: 'Germany', 'SUM(SP_POP_TOTL)': 4361793335 },
  { country_name: 'Ghana', 'SUM(SP_POP_TOTL)': 801844889 },
  { country_name: 'Greece', 'SUM(SP_POP_TOTL)': 547065293 },
  { country_name: 'Greenland', 'SUM(SP_POP_TOTL)': 2807533 },
  { country_name: 'Grenada', 'SUM(SP_POP_TOTL)': 5366107 },
  { country_name: 'Guam', 'SUM(SP_POP_TOTL)': 6647797 },
  { country_name: 'Guatemala', 'SUM(SP_POP_TOTL)': 498361800 },
  { country_name: 'Guinea', 'SUM(SP_POP_TOTL)': 362469063 },
  { country_name: 'Guinea-Bissau', 'SUM(SP_POP_TOTL)': 58400669 },
  { country_name: 'Guyana', 'SUM(SP_POP_TOTL)': 39868752 },
  { country_name: 'Haiti', 'SUM(SP_POP_TOTL)': 377521290 },
  { country_name: 'Honduras', 'SUM(SP_POP_TOTL)': 257791863 },
  { country_name: 'Hong Kong SAR, China', 'SUM(SP_POP_TOTL)': 298353905 },
  { country_name: 'Hungary', 'SUM(SP_POP_TOTL)': 566995908 },
  { country_name: 'Iceland', 'SUM(SP_POP_TOTL)': 13716537 },
  { country_name: 'India', 'SUM(SP_POP_TOTL)': 46023037597 },
  { country_name: 'Indonesia', 'SUM(SP_POP_TOTL)': 9357861231 },
  { country_name: 'Iran, Islamic Rep.', 'SUM(SP_POP_TOTL)': 2717528355 },
  { country_name: 'Iraq', 'SUM(SP_POP_TOTL)': 983604177 },
  { country_name: 'Ireland', 'SUM(SP_POP_TOTL)': 196019322 },
  { country_name: 'Isle of Man', 'SUM(SP_POP_TOTL)': 3728525 },
  { country_name: 'Israel', 'SUM(SP_POP_TOTL)': 263866720 },
  { country_name: 'Italy', 'SUM(SP_POP_TOTL)': 3082869665 },
  { country_name: 'Jamaica', 'SUM(SP_POP_TOTL)': 124779119 },
  { country_name: 'Japan', 'SUM(SP_POP_TOTL)': 6454620759 },
  { country_name: 'Jordan', 'SUM(SP_POP_TOTL)': 180850641 },
  { country_name: 'Kazakhstan', 'SUM(SP_POP_TOTL)': 797168043 },
  { country_name: 'Kenya', 'SUM(SP_POP_TOTL)': 1253201109 },
  { country_name: 'Kiribati', 'SUM(SP_POP_TOTL)': 3874990 },
  { country_name: 'Korea, Dem. Rep.', 'SUM(SP_POP_TOTL)': 1047335229 },
  { country_name: 'Korea, Rep.', 'SUM(SP_POP_TOTL)': 2216456927 },
  { country_name: 'Kosovo', 'SUM(SP_POP_TOTL)': 86627232 },
  { country_name: 'Kuwait', 'SUM(SP_POP_TOTL)': 84737006 },
  { country_name: 'Kyrgyz Republic', 'SUM(SP_POP_TOTL)': 222809200 },
  { country_name: 'Lao PDR', 'SUM(SP_POP_TOTL)': 227340983 },
  { country_name: 'Latvia', 'SUM(SP_POP_TOTL)': 130544986 },
  { country_name: 'Lebanon', 'SUM(SP_POP_TOTL)': 162031498 },
  { country_name: 'Lesotho', 'SUM(SP_POP_TOTL)': 81971241 },
  { country_name: 'Liberia', 'SUM(SP_POP_TOTL)': 125666085 },
  { country_name: 'Libya', 'SUM(SP_POP_TOTL)': 217716251 },
  { country_name: 'Liechtenstein', 'SUM(SP_POP_TOTL)': 1527171 },
  { country_name: 'Lithuania', 'SUM(SP_POP_TOTL)': 182416949 },
  { country_name: 'Luxembourg', 'SUM(SP_POP_TOTL)': 21852156 },
  { country_name: 'Macao SAR, China', 'SUM(SP_POP_TOTL)': 18882494 },
  { country_name: 'Macedonia, FYR', 'SUM(SP_POP_TOTL)': 104100695 },
  { country_name: 'Madagascar', 'SUM(SP_POP_TOTL)': 656478313 },
  { country_name: 'Malawi', 'SUM(SP_POP_TOTL)': 470725354 },
  { country_name: 'Malaysia', 'SUM(SP_POP_TOTL)': 978122682 },
  { country_name: 'Maldives', 'SUM(SP_POP_TOTL)': 11478624 },
  { country_name: 'Mali', 'SUM(SP_POP_TOTL)': 500758830 },
  { country_name: 'Malta', 'SUM(SP_POP_TOTL)': 19363458 },
  { country_name: 'Marshall Islands', 'SUM(SP_POP_TOTL)': 2086174 },
  { country_name: 'Mauritania', 'SUM(SP_POP_TOTL)': 113489314 },
  { country_name: 'Mauritius', 'SUM(SP_POP_TOTL)': 56066051 },
  { country_name: 'Mexico', 'SUM(SP_POP_TOTL)': 4444653964 },
  { country_name: 'Micronesia, Fed. Sts.', 'SUM(SP_POP_TOTL)': 4627492 },
  { country_name: 'Moldova', 'SUM(SP_POP_TOTL)': 186156257 },
  { country_name: 'Monaco', 'SUM(SP_POP_TOTL)': 1595554 },
  { country_name: 'Mongolia', 'SUM(SP_POP_TOTL)': 106717826 },
  { country_name: 'Montenegro', 'SUM(SP_POP_TOTL)': 31652512 },
  { country_name: 'Morocco', 'SUM(SP_POP_TOTL)': 1277441301 },
  { country_name: 'Mozambique', 'SUM(SP_POP_TOTL)': 807229371 },
  { country_name: 'Myanmar', 'SUM(SP_POP_TOTL)': 2126848982 },
  { country_name: 'Namibia', 'SUM(SP_POP_TOTL)': 75238033 },
  { country_name: 'Nepal', 'SUM(SP_POP_TOTL)': 1007162709 },
  { country_name: 'Netherlands', 'SUM(SP_POP_TOTL)': 803013980 },
  { country_name: 'New Caledonia', 'SUM(SP_POP_TOTL)': 9225822 },
  { country_name: 'New Zealand', 'SUM(SP_POP_TOTL)': 187593600 },
  { country_name: 'Nicaragua', 'SUM(SP_POP_TOTL)': 213048662 },
  { country_name: 'Niger', 'SUM(SP_POP_TOTL)': 471910464 },
  { country_name: 'Nigeria', 'SUM(SP_POP_TOTL)': 5259800493 },
  { country_name: 'Northern Mariana Islands', 'SUM(SP_POP_TOTL)': 2015842 },
  { country_name: 'Norway', 'SUM(SP_POP_TOTL)': 233337059 },
  { country_name: 'Oman', 'SUM(SP_POP_TOTL)': 93132249 },
  { country_name: 'Pakistan', 'SUM(SP_POP_TOTL)': 5696041480 },
  { country_name: 'Palau', 'SUM(SP_POP_TOTL)': 833299 },
  { country_name: 'Panama', 'SUM(SP_POP_TOTL)': 130974461 },
  { country_name: 'Papua New Guinea', 'SUM(SP_POP_TOTL)': 228299012 },
  { country_name: 'Paraguay', 'SUM(SP_POP_TOTL)': 221768661 },
  { country_name: 'Peru', 'SUM(SP_POP_TOTL)': 1121937313 },
  { country_name: 'Philippines', 'SUM(SP_POP_TOTL)': 3272015554 },
  { country_name: 'Poland', 'SUM(SP_POP_TOTL)': 1976772515 },
  { country_name: 'Portugal', 'SUM(SP_POP_TOTL)': 536945679 },
  { country_name: 'Puerto Rico', 'SUM(SP_POP_TOTL)': 181515497 },
  { country_name: 'Qatar', 'SUM(SP_POP_TOTL)': 30075210 },
  { country_name: 'Romania', 'SUM(SP_POP_TOTL)': 1171333228 },
  { country_name: 'Russian Federation', 'SUM(SP_POP_TOTL)': 7667188460 },
  { country_name: 'Rwanda', 'SUM(SP_POP_TOTL)': 347121852 },
  { country_name: 'Samoa', 'SUM(SP_POP_TOTL)': 8770470 },
  { country_name: 'San Marino', 'SUM(SP_POP_TOTL)': 1298411 },
  { country_name: 'Sao Tome and Principe', 'SUM(SP_POP_TOTL)': 6169644 },
  { country_name: 'Saudi Arabia', 'SUM(SP_POP_TOTL)': 828451525 },
  { country_name: 'Senegal', 'SUM(SP_POP_TOTL)': 414475224 },
  { country_name: 'Serbia', 'SUM(SP_POP_TOTL)': 186596480 },
  { country_name: 'Seychelles', 'SUM(SP_POP_TOTL)': 3761184 },
  { country_name: 'Sierra Leone', 'SUM(SP_POP_TOTL)': 203443826 },
  { country_name: 'Singapore', 'SUM(SP_POP_TOTL)': 173168000 },
  { country_name: 'Sint Maarten (Dutch part)', 'SUM(SP_POP_TOTL)': 597781 },
  { country_name: 'Slovak Republic', 'SUM(SP_POP_TOTL)': 276228375 },
  { country_name: 'Slovenia', 'SUM(SP_POP_TOTL)': 104119695 },
  { country_name: 'Solomon Islands', 'SUM(SP_POP_TOTL)': 16859526 },
  { country_name: 'Somalia', 'SUM(SP_POP_TOTL)': 332677926 },
  { country_name: 'South Africa', 'SUM(SP_POP_TOTL)': 1871083248 },
  { country_name: 'South Sudan', 'SUM(SP_POP_TOTL)': 319024522 },
  { country_name: 'Spain', 'SUM(SP_POP_TOTL)': 2115316751 },
  { country_name: 'Sri Lanka', 'SUM(SP_POP_TOTL)': 881137000 },
  { country_name: 'St. Kitts and Nevis', 'SUM(SP_POP_TOTL)': 2535482 },
  { country_name: 'St. Lucia', 'SUM(SP_POP_TOTL)': 7336842 },
  { country_name: 'St. Martin (French part)', 'SUM(SP_POP_TOTL)': 1020457 },
  {
    country_name: 'St. Vincent and the Grenadines',
    'SUM(SP_POP_TOTL)': 5557117,
  },
  { country_name: 'Sudan', 'SUM(SP_POP_TOTL)': 1118903636 },
  { country_name: 'Suriname', 'SUM(SP_POP_TOTL)': 22687861 },
  { country_name: 'Swaziland', 'SUM(SP_POP_TOTL)': 42858935 },
  { country_name: 'Sweden', 'SUM(SP_POP_TOTL)': 468210684 },
  { country_name: 'Switzerland', 'SUM(SP_POP_TOTL)': 369360744 },
  { country_name: 'Syrian Arab Republic', 'SUM(SP_POP_TOTL)': 663924524 },
  { country_name: 'Tajikistan', 'SUM(SP_POP_TOTL)': 267603756 },
  { country_name: 'Tanzania', 'SUM(SP_POP_TOTL)': 1413734053 },
  { country_name: 'Thailand', 'SUM(SP_POP_TOTL)': 2827157965 },
  { country_name: 'Timor-Leste', 'SUM(SP_POP_TOTL)': 41694123 },
  { country_name: 'Togo', 'SUM(SP_POP_TOTL)': 204624027 },
  { country_name: 'Tonga', 'SUM(SP_POP_TOTL)': 5038574 },
  { country_name: 'Trinidad and Tobago', 'SUM(SP_POP_TOTL)': 62771502 },
  { country_name: 'Tunisia', 'SUM(SP_POP_TOTL)': 415992799 },
  { country_name: 'Turkey', 'SUM(SP_POP_TOTL)': 2805220683 },
  { country_name: 'Turkmenistan', 'SUM(SP_POP_TOTL)': 189687365 },
  { country_name: 'Turks and Caicos Islands', 'SUM(SP_POP_TOTL)': 775185 },
  { country_name: 'Tuvalu', 'SUM(SP_POP_TOTL)': 466709 },
  { country_name: 'Uganda', 'SUM(SP_POP_TOTL)': 987376102 },
  { country_name: 'Ukraine', 'SUM(SP_POP_TOTL)': 2657782543 },
  { country_name: 'United Arab Emirates', 'SUM(SP_POP_TOTL)': 134952923 },
  { country_name: 'United Kingdom', 'SUM(SP_POP_TOTL)': 3169118137 },
  { country_name: 'United States', 'SUM(SP_POP_TOTL)': 13604468357 },
  { country_name: 'Uruguay', 'SUM(SP_POP_TOTL)': 167612670 },
  { country_name: 'Uzbekistan', 'SUM(SP_POP_TOTL)': 1053380227 },
  { country_name: 'Vanuatu', 'SUM(SP_POP_TOTL)': 7966814 },
  { country_name: 'Venezuela, RB', 'SUM(SP_POP_TOTL)': 1036057583 },
  { country_name: 'Vietnam', 'SUM(SP_POP_TOTL)': 3420037000 },
  { country_name: 'Virgin Islands (U.S.)', 'SUM(SP_POP_TOTL)': 5006756 },
  { country_name: 'West Bank and Gaza', 'SUM(SP_POP_TOTL)': 77390117 },
  { country_name: 'Yemen, Rep.', 'SUM(SP_POP_TOTL)': 695646128 },
  { country_name: 'Zambia', 'SUM(SP_POP_TOTL)': 438847085 },
  { country_name: 'Zimbabwe', 'SUM(SP_POP_TOTL)': 509866860 },
];

export const buildNativeFilter = (
  id: string,
  name: string,
  parents: string[],
) => ({
  id,
  controlValues: {
    multiSelect: true,
    enableEmptyFilter: false,
    defaultToFirstItem: false,
    inverseSelection: false,
    searchAllOptions: false,
  },
  name,
  filterType: 'filter_select',
  targets: [
    {
      datasetId: 1,
      column: {
        name,
      },
    },
  ],
  defaultDataMask: {
    extraFormData: {},
    filterState: {},
    ownState: {},
  },
  cascadeParentIds: parents,
  scope: {
    rootPath: ['ROOT_ID'],
    excluded: [],
  },
  type: 'NATIVE_FILTER',
});
