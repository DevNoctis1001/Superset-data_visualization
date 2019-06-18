import React from 'react';
import { ChartMetadata, ChartPlugin, ChartFormData } from '../../src';

const DIMENSION_STYLE = {
  fontSize: 36,
  fontWeight: 700,
  flex: '1 1 auto',
  display: 'flex',
  alignItems: 'center',
};

export const TestComponent = ({
  formData,
  message,
  width,
  height,
}: {
  formData?: any;
  message?: string;
  width?: number;
  height?: number;
}) => (
  <div
    className="test-component"
    style={{
      width,
      height,
      backgroundColor: '#00d1c1',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 8,
    }}
  >
    <div className="message" style={{ padding: 10 }}>
      {message || 'custom component'}
    </div>
    <div className="dimension" style={DIMENSION_STYLE}>
      {[width, height].join('x')}
    </div>
    <div className="formData" style={{ padding: 10 }}>
      <code style={{ color: '#D3F9F7' }}>{JSON.stringify(formData)}</code>
    </div>
  </div>
);

export const ChartKeys = {
  DILIGENT: 'diligent-chart',
  LAZY: 'lazy-chart',
  SLOW: 'slow-chart',
  BUGGY: 'buggy-chart',
};

export class DiligentChartPlugin extends ChartPlugin<ChartFormData> {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: ChartKeys.DILIGENT,
        thumbnail: '',
      }),
      Chart: TestComponent,
      transformProps: x => x,
    });
  }
}

export class LazyChartPlugin extends ChartPlugin<ChartFormData> {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: ChartKeys.LAZY,
        thumbnail: '',
      }),
      // this mirrors `() => import(module)` syntax
      loadChart: () => Promise.resolve({ default: TestComponent }),
      // promise without .default
      loadTransformProps: () => Promise.resolve((x: any) => x),
    });
  }
}

export class SlowChartPlugin extends ChartPlugin<ChartFormData> {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: ChartKeys.SLOW,
        thumbnail: '',
      }),
      loadChart: () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(TestComponent);
          }, 1000);
        }),
      transformProps: x => x,
    });
  }
}

export class BuggyChartPlugin extends ChartPlugin<ChartFormData> {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: ChartKeys.BUGGY,
        thumbnail: '',
      }),
      Chart: () => {
        throw new Error('The component is too buggy to render.');
      },
      transformProps: x => x,
    });
  }
}
