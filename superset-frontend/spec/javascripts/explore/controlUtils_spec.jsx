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

import { getChartControlPanelRegistry, t } from '@superset-ui/core';
import {
  getControlConfig,
  getControlState,
  getFormDataFromControls,
  applyMapStateToPropsToControl,
  getAllControlsState,
  findControlItem,
} from 'src/explore/controlUtils';
import {
  controlPanelSectionsChartOptions,
  controlPanelSectionsChartOptionsOnlyColorScheme,
  controlPanelSectionsChartOptionsTable,
} from 'spec/javascripts/explore/fixtures';

describe('controlUtils', () => {
  const state = {
    datasource: {
      columns: ['a', 'b', 'c'],
      metrics: [{ metric_name: 'first' }, { metric_name: 'second' }],
    },
    controls: {},
  };

  beforeAll(() => {
    getChartControlPanelRegistry()
      .registerValue('test-chart', {
        controlPanelSections: controlPanelSectionsChartOptions,
      })
      .registerValue('test-chart-override', {
        controlPanelSections: controlPanelSectionsChartOptionsOnlyColorScheme,
        controlOverrides: {
          color_scheme: {
            label: t('My beautiful colors'),
          },
        },
      })
      .registerValue('table', {
        controlPanelSections: controlPanelSectionsChartOptionsTable,
      });
  });

  afterAll(() => {
    getChartControlPanelRegistry()
      .remove('test-chart')
      .remove('test-chart-override');
  });

  describe('getControlConfig', () => {
    it('returns a valid spatial controlConfig', () => {
      const spatialControl = getControlConfig('color_scheme', 'test-chart');
      expect(spatialControl.type).toEqual('ColorSchemeControl');
    });

    it('overrides according to vizType', () => {
      let control = getControlConfig('color_scheme', 'test-chart');
      expect(control.label).toEqual('Color Scheme');

      // deck_polygon overrides and removes validators
      control = getControlConfig('color_scheme', 'test-chart-override');
      expect(control.label).toEqual('My beautiful colors');
    });

    it(
      'returns correct control config when control config is defined ' +
        'in the control panel definition',
      () => {
        const roseAreaProportionControlConfig = getControlConfig(
          'rose_area_proportion',
          'test-chart',
        );
        expect(roseAreaProportionControlConfig).toEqual({
          type: 'CheckboxControl',
          label: t('Use Area Proportions'),
          description: t(
            'Check if the Rose Chart should use segment area instead of ' +
              'segment radius for proportioning',
          ),
          default: false,
          renderTrigger: true,
        });
      },
    );
  });

  describe('applyMapStateToPropsToControl,', () => {
    it('applies state to props as expected', () => {
      let control = getControlConfig('all_columns', 'table');
      control = applyMapStateToPropsToControl(control, state);
      expect(control.options).toEqual(['a', 'b', 'c']);
    });

    it('removes the mapStateToProps key from the object', () => {
      let control = getControlConfig('all_columns', 'table');
      control = applyMapStateToPropsToControl(control, state);
      expect(control.mapStateToProps[0]).toBe(undefined);
    });
  });

  describe('getControlState', () => {
    it('to still have the functions', () => {
      const control = getControlState('metrics', 'table', state, ['a']);
      expect(typeof control.mapStateToProps).toBe('function');
      expect(typeof control.validators[0]).toBe('function');
    });

    it('to fix multi with non-array values', () => {
      const control = getControlState('all_columns', 'table', state, 'a');
      expect(control.value).toEqual(['a']);
    });

    it('removes missing/invalid choice', () => {
      let control = getControlState(
        'stacked_style',
        'test-chart',
        state,
        'stack',
      );
      expect(control.value).toBe('stack');

      control = getControlState('stacked_style', 'test-chart', state, 'FOO');
      expect(control.value).toBeNull();
    });

    it('returns null for non-existent field', () => {
      const control = getControlState('NON_EXISTENT', 'table', state);
      expect(control).toBeNull();
    });

    it('applies the default function for metrics', () => {
      const control = getControlState('metrics', 'table', state);
      expect(control.default).toEqual(['first']);
    });

    it('applies the default function for metric', () => {
      const control = getControlState('metric', 'table', state);
      expect(control.default).toEqual('first');
    });

    it('applies the default function, prefers count if it exists', () => {
      const stateWithCount = {
        ...state,
        datasource: {
          ...state.datasource,
          metrics: [
            { metric_name: 'first' },
            { metric_name: 'second' },
            { metric_name: 'count' },
          ],
        },
      };
      const control = getControlState('metrics', 'table', stateWithCount);
      expect(control.default).toEqual(['count']);
    });

    it('should not apply mapStateToProps when initializing', () => {
      const control = getControlState('metrics', 'table', {
        ...state,
        controls: undefined,
      });
      expect(typeof control.default).toBe('function');
      expect(control.value).toBe(undefined);
    });
  });

  describe('validateControl', () => {
    it('validates the control, returns an error if empty', () => {
      const control = getControlState('metric', 'table', state, null);
      expect(control.validationErrors).toEqual(['cannot be empty']);
    });
    it('should not validate if control panel is initializing', () => {
      const control = getControlState(
        'metric',
        'table',
        { ...state, controls: undefined },
        undefined,
      );
      expect(control.validationErrors).toBeUndefined();
    });
  });

  describe('findControlItem', () => {
    it('find control as a string', () => {
      const controlItem = findControlItem(
        controlPanelSectionsChartOptions,
        'color_scheme',
      );
      expect(controlItem).toEqual('color_scheme');
    });

    it('find control as a control object', () => {
      let controlItem = findControlItem(
        controlPanelSectionsChartOptions,
        'rose_area_proportion',
      );
      expect(controlItem.name).toEqual('rose_area_proportion');
      expect(controlItem).toHaveProperty('config');

      controlItem = findControlItem(
        controlPanelSectionsChartOptions,
        'stacked_style',
      );
      expect(controlItem.name).toEqual('stacked_style');
      expect(controlItem).toHaveProperty('config');
    });

    it('returns null when key is not found', () => {
      const controlItem = findControlItem(
        controlPanelSectionsChartOptions,
        'non_existing_key',
      );
      expect(controlItem).toBeNull();
    });
  });
});
