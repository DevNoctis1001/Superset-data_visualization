import { CategoricalColorScale } from '@superset-ui/color';
import { scaleLinear, scaleOrdinal, scaleTime, scaleLog } from 'd3-scale';
import { isD3Scale, isCategoricalColorScale, isTimeScale } from '../../src/typeGuards/Scale';
import { HasToString } from '../../src/types/Base';

describe('type guards', () => {
  describe('isD3Scale(scale)', () => {
    it('returns true if it is one of D3 scales', () => {
      expect(isD3Scale(scaleLinear())).toBeTruthy();
      expect(isD3Scale(scaleOrdinal<HasToString, string>())).toBeTruthy();
    });
    it('returns false otherwise', () => {
      expect(isD3Scale(new CategoricalColorScale(['red', 'yellow']))).toBeFalsy();
    });
  });
  describe('isCategoricalColorScale(scale)', () => {
    it('returns true if it is CategoricalColorScale', () => {
      expect(isCategoricalColorScale(new CategoricalColorScale(['red', 'yellow']))).toBeTruthy();
    });
    it('returns false otherwise', () => {
      expect(isCategoricalColorScale(scaleLinear())).toBeFalsy();
    });
  });
  describe('isTimeScale(scale, type)', () => {
    it('returns true if type is one of the time scale types', () => {
      expect(isTimeScale(scaleTime(), 'time')).toBeTruthy();
      expect(isTimeScale(scaleTime(), 'utc')).toBeTruthy();
    });
    it('returns false otherwise', () => {
      expect(isTimeScale(scaleLinear(), 'linear')).toBeFalsy();
      expect(isTimeScale(scaleLog(), 'log')).toBeFalsy();
    });
  });
});
