import { DateTime } from 'vega-lite/build/src/datetime';
import { AxisOrient } from 'vega';

export type LabelOverlapStrategy = 'auto' | 'flat' | 'rotate';

export interface CoreAxis {
  format?: string;
  labelAngle: number;
  labelOverlap: LabelOverlapStrategy;
  /** The padding, in pixels, between axis and text labels. */
  labelPadding: number;
  orient: AxisOrient;
  tickCount: number;
  title?: string;
  /** Explicitly set the visible axis tick values. */
  values?: string[] | number[] | boolean[] | DateTime[];
}

export type Axis = Partial<CoreAxis>;

export interface XAxis extends Axis {
  orient?: 'top' | 'bottom';
  labelAngle?: number;
  labelOverlap?: LabelOverlapStrategy;
}

export interface WithXAxis {
  axis?: XAxis;
}

export interface YAxis extends Axis {
  orient?: 'left' | 'right';
  labelAngle?: 0;
  labelOverlap?: 'auto' | 'flat';
}

export interface WithYAxis {
  axis?: YAxis;
}

export interface WithAxis {
  axis?: XAxis | YAxis;
}

export function isAxis(axis: Axis | null | undefined | false): axis is Axis {
  return axis !== false && axis !== null && axis !== undefined;
}
