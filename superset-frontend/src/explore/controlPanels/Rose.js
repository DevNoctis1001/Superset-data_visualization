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
import { t } from '@superset-ui/translation';
import { NVD3TimeSeries } from './sections';

export default {
  requiresTime: true,
  controlPanelSections: [
    NVD3TimeSeries[0],
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme', 'label_colors'],
        ['number_format', 'date_time_format'],
        [
          {
            name: 'rich_tooltip',
            config: {
              type: 'CheckboxControl',
              label: t('Rich Tooltip'),
              renderTrigger: true,
              default: true,
              description: t(
                'The rich tooltip shows a list of all series for that point in time',
              ),
            },
          },
          {
            name: 'rose_area_proportion',
            config: {
              type: 'CheckboxControl',
              label: t('Use Area Proportions'),
              description: t(
                'Check if the Rose Chart should use segment area instead of ' +
                  'segment radius for proportioning',
              ),
              default: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    NVD3TimeSeries[1],
  ],
};
