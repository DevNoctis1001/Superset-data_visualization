/*
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
  CategoricalScheme,
  FeatureFlag,
  getCategoricalSchemeRegistry,
  getSharedLabelColor,
  SharedLabelColor,
  SharedLabelColorSource,
} from '@superset-ui/core';
import { getAnalogousColors } from '../../src/color/utils';

jest.mock('../../src/color/utils', () => ({
  getAnalogousColors: jest
    .fn()
    .mockImplementation(() => ['red', 'green', 'blue']),
}));

describe('SharedLabelColor', () => {
  beforeAll(() => {
    getCategoricalSchemeRegistry()
      .registerValue(
        'testColors',
        new CategoricalScheme({
          id: 'testColors',
          colors: ['red', 'green', 'blue'],
        }),
      )
      .registerValue(
        'testColors2',
        new CategoricalScheme({
          id: 'testColors2',
          colors: ['yellow', 'green', 'blue'],
        }),
      );
  });

  beforeEach(() => {
    getSharedLabelColor().source = SharedLabelColorSource.dashboard;
    getSharedLabelColor().clear();
  });

  it('has default value out-of-the-box', () => {
    expect(getSharedLabelColor()).toBeInstanceOf(SharedLabelColor);
  });

  describe('.addSlice(value, color, sliceId)', () => {
    it('should add to sliceLabelColorMap when first adding label', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      expect(sharedLabelColor.sliceLabelColorMap.has(1)).toEqual(true);
      const colorMap = sharedLabelColor.sliceLabelColorMap.get(1);
      expect(colorMap?.has('a')).toEqual(true);
      expect(colorMap?.get('a')).toEqual('red');
    });

    it('should add to sliceLabelColorMap when label exist', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.addSlice('b', 'blue', 1);
      const colorMap = sharedLabelColor.sliceLabelColorMap.get(1);
      expect(colorMap?.has('b')).toEqual(true);
      expect(colorMap?.get('b')).toEqual('blue');
    });

    it('should do nothing when source is not dashboard', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.source = SharedLabelColorSource.explore;
      sharedLabelColor.addSlice('a', 'red');
      expect(Object.fromEntries(sharedLabelColor.sliceLabelColorMap)).toEqual(
        {},
      );
    });

    it('should do nothing when sliceId is undefined', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red');
      expect(Object.fromEntries(sharedLabelColor.sliceLabelColorMap)).toEqual(
        {},
      );
    });
  });

  describe('.remove(sliceId)', () => {
    it('should remove sliceId', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.removeSlice(1);
      expect(sharedLabelColor.sliceLabelColorMap.has(1)).toEqual(false);
    });

    it('should do nothing when source is not dashboard', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.source = SharedLabelColorSource.explore;
      sharedLabelColor.removeSlice(1);
      expect(sharedLabelColor.sliceLabelColorMap.has(1)).toEqual(true);
    });
  });

  describe('.updateColorMap(namespace, scheme)', () => {
    it('should update color map', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.addSlice('b', 'green', 2);
      sharedLabelColor.updateColorMap('', 'testColors2');
      const colorMap = sharedLabelColor.getColorMap();
      expect(colorMap).toEqual({ a: 'yellow', b: 'green' });
    });

    it('should use recycle colors', () => {
      window.featureFlags = {
        [FeatureFlag.USE_ANALAGOUS_COLORS]: false,
      };
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.addSlice('b', 'blue', 2);
      sharedLabelColor.addSlice('c', 'green', 3);
      sharedLabelColor.addSlice('d', 'red', 4);
      sharedLabelColor.updateColorMap('', 'testColors');
      const colorMap = sharedLabelColor.getColorMap();
      expect(colorMap).not.toEqual({});
      expect(getAnalogousColors).not.toBeCalled();
    });

    it('should use analagous colors', () => {
      window.featureFlags = {
        [FeatureFlag.USE_ANALAGOUS_COLORS]: true,
      };
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.addSlice('b', 'blue', 2);
      sharedLabelColor.addSlice('c', 'green', 3);
      sharedLabelColor.addSlice('d', 'red', 4);
      sharedLabelColor.updateColorMap('', 'testColors');
      const colorMap = sharedLabelColor.getColorMap();
      expect(colorMap).not.toEqual({});
      expect(getAnalogousColors).toBeCalled();
    });
  });

  describe('.getColorMap()', () => {
    it('should get color map', () => {
      const sharedLabelColor = getSharedLabelColor();
      sharedLabelColor.addSlice('a', 'red', 1);
      sharedLabelColor.addSlice('b', 'blue', 2);
      const colorMap = sharedLabelColor.getColorMap();
      expect(colorMap).toEqual({ a: 'red', b: 'blue' });
    });
  });
});
