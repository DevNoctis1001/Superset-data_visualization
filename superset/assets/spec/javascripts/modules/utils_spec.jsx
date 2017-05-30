import { it, describe } from 'mocha';
import { expect } from 'chai';
import {
  tryNumify, slugify, formatSelectOptionsForRange, d3format,
} from '../../../javascripts/modules/utils';

describe('utils', () => {
  it('tryNumify works as expected', () => {
    expect(tryNumify(5)).to.equal(5);
    expect(tryNumify('5')).to.equal(5);
    expect(tryNumify('5.1')).to.equal(5.1);
    expect(tryNumify('a string')).to.equal('a string');
  });
  it('slugify slugifies', () => {
    expect(slugify('My Neat Label! ')).to.equal('my-neat-label');
    expect(slugify('Some Letters AnD a 5')).to.equal('some-letters-and-a-5');
    expect(slugify(' 439278 ')).to.equal('439278');
    expect(slugify('5')).to.equal('5');
  });
  it('formatSelectOptionsForRange', () => {
    expect(formatSelectOptionsForRange(0, 4)).to.deep.equal([
      [0, '0'],
      [1, '1'],
      [2, '2'],
      [3, '3'],
      [4, '4'],
    ]);
    expect(formatSelectOptionsForRange(1, 2)).to.deep.equal([
      [1, '1'],
      [2, '2'],
    ]);
  });
  it('d3format', () => {
    expect(d3format('.3s', 1234)).to.equal('1.23k');
    expect(d3format('.3s', 1237)).to.equal('1.24k');
    expect(d3format('', 1237)).to.equal('1.24k');
  });
});
