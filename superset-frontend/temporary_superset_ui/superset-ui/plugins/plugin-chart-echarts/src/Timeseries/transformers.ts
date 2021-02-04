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
  AnnotationData,
  AnnotationLayer,
  AnnotationOpacity,
  CategoricalColorScale,
  EventAnnotationLayer,
  IntervalAnnotationLayer,
  isTimeseriesAnnotationResult,
  TimeseriesAnnotationLayer,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import { SeriesOption } from 'echarts';
import {
  CallbackDataParams,
  DefaultExtraStateOpts,
  ItemStyleOption,
  LineStyleOption,
  OptionName,
  ZRLineType,
} from 'echarts/types/src/util/types';
import {
  MarkArea1DDataItemOption,
  MarkArea2DDataItemOption,
} from 'echarts/types/src/component/marker/MarkAreaModel';
import { extractForecastSeriesContext } from '../utils/prophet';
import { ForecastSeriesEnum } from '../types';
import { DEFAULT_FORM_DATA, EchartsTimeseriesFormData } from './types';
import {
  evalFormula,
  extractRecordAnnotations,
  formatAnnotationLabel,
  parseAnnotationOpacity,
} from '../utils/annotation';

export function transformSeries(
  series: SeriesOption,
  formData: EchartsTimeseriesFormData,
  colorScale: CategoricalColorScale,
): SeriesOption | undefined {
  const { name } = series;
  const {
    area,
    forecastEnabled,
    markerEnabled,
    markerSize,
    opacity,
    seriesType,
    stack,
    richTooltip,
  }: EchartsTimeseriesFormData = {
    ...DEFAULT_FORM_DATA,
    ...formData,
  };
  const forecastSeries = extractForecastSeriesContext(name || '');
  const isConfidenceBand =
    forecastSeries.type === ForecastSeriesEnum.ForecastLower ||
    forecastSeries.type === ForecastSeriesEnum.ForecastUpper;

  // don't create a series if doing a stack or area chart and the result
  // is a confidence band
  if ((stack || area) && isConfidenceBand) return undefined;

  const isObservation = forecastSeries.type === ForecastSeriesEnum.Observation;
  const isTrend = forecastSeries.type === ForecastSeriesEnum.ForecastTrend;
  let stackId;
  if (isConfidenceBand) {
    stackId = forecastSeries.name;
  } else if (stack && isObservation) {
    // the suffix of the observation series is '' (falsy), which disables
    // stacking. Therefore we need to set something that is truthy.
    stackId = 'obs';
  } else if (stack && isTrend) {
    stackId = forecastSeries.type;
  }
  let plotType;
  if (!isConfidenceBand && (seriesType === 'scatter' || (forecastEnabled && isObservation))) {
    plotType = 'scatter';
  } else if (isConfidenceBand) {
    plotType = 'line';
  } else {
    plotType = seriesType === 'bar' ? 'bar' : 'line';
  }
  const lineStyle = isConfidenceBand ? { opacity: 0 } : {};

  return {
    ...series,
    name: forecastSeries.name,
    itemStyle: {
      color: colorScale(forecastSeries.name),
    },
    // @ts-ignore
    type: plotType,
    smooth: seriesType === 'smooth',
    // @ts-ignore
    step: ['start', 'middle', 'end'].includes(seriesType as string) ? seriesType : undefined,
    stack: stackId,
    lineStyle,
    areaStyle: {
      opacity: forecastSeries.type === ForecastSeriesEnum.ForecastUpper || area ? opacity : 0,
    },
    showSymbol:
      !isConfidenceBand &&
      (plotType === 'scatter' ||
        (forecastEnabled && isObservation) ||
        markerEnabled ||
        !richTooltip), // TODO: forcing markers when richTooltip is enabled will be removed once ECharts supports item based tooltips without markers
    symbolSize: markerSize,
  };
}

export function transformFormulaAnnotation(
  layer: AnnotationLayer,
  data: TimeseriesDataRecord[],
  colorScale: CategoricalColorScale,
): SeriesOption {
  const { name, color, opacity, width, style } = layer;
  return {
    name,
    id: name,
    itemStyle: {
      color: color || colorScale(name),
    },
    lineStyle: {
      opacity: parseAnnotationOpacity(opacity),
      type: style as ZRLineType,
      width,
    },
    type: 'line',
    smooth: true,
    data: evalFormula(layer, data),
    symbolSize: 0,
    z: 0,
  };
}

export function transformIntervalAnnotation(
  layer: IntervalAnnotationLayer,
  data: TimeseriesDataRecord[],
  annotationData: AnnotationData,
  colorScale: CategoricalColorScale,
): SeriesOption[] {
  const series: SeriesOption[] = [];
  const annotations = extractRecordAnnotations(layer, annotationData);
  annotations.forEach(annotation => {
    const { name, color, opacity } = layer;
    const { descriptions, intervalEnd, time, title } = annotation;
    const label = formatAnnotationLabel(name, title, descriptions);
    const intervalData: (MarkArea1DDataItemOption | MarkArea2DDataItemOption)[] = [
      [
        {
          name: label,
          xAxis: time,
        },
        {
          xAxis: intervalEnd,
        },
      ],
    ];
    series.push({
      id: `Interval - ${label}`,
      type: 'line',
      animation: false,
      markArea: {
        silent: false,
        itemStyle: {
          color: color || colorScale(name),
          opacity: parseAnnotationOpacity(opacity || AnnotationOpacity.Medium),
          emphasis: {
            opacity: 0.8,
          },
        } as ItemStyleOption,
        label: {
          show: false,
          color: '#000000',
          // @ts-ignore
          emphasis: {
            fontWeight: 'bold',
            show: true,
            position: 'insideTop',
            verticalAlign: 'top',
            backgroundColor: '#ffffff',
          },
        },
        data: intervalData,
      },
    });
  });
  return series;
}

export function transformEventAnnotation(
  layer: EventAnnotationLayer,
  data: TimeseriesDataRecord[],
  annotationData: AnnotationData,
  colorScale: CategoricalColorScale,
): SeriesOption[] {
  const series: SeriesOption[] = [];
  const annotations = extractRecordAnnotations(layer, annotationData);
  annotations.forEach(annotation => {
    const { name, color, opacity, style, width } = layer;
    const { descriptions, time, title } = annotation;
    const label = formatAnnotationLabel(name, title, descriptions);
    const eventData = [
      {
        name: label,
        xAxis: (time as unknown) as number,
      },
    ];

    const lineStyle: LineStyleOption & DefaultExtraStateOpts['emphasis'] = {
      width,
      type: style as ZRLineType,
      color: color || colorScale(name),
      opacity: parseAnnotationOpacity(opacity),
      emphasis: {
        width: width ? width + 1 : width,
        opacity: 1,
      },
    };

    series.push({
      id: `Event - ${label}`,
      type: 'line',
      animation: false,
      markLine: {
        silent: false,
        symbol: 'none',
        lineStyle,
        label: {
          show: false,
          color: '#000000',
          position: 'insideEndTop',
          // @ts-ignore
          emphasis: {
            formatter: (params: CallbackDataParams) => params.name,
            fontWeight: 'bold',
            show: true,
            backgroundColor: '#ffffff',
          },
        },
        data: eventData,
      },
    });
  });
  return series;
}

export function transformTimeseriesAnnotation(
  layer: TimeseriesAnnotationLayer,
  formData: EchartsTimeseriesFormData,
  data: TimeseriesDataRecord[],
  annotationData: AnnotationData,
): SeriesOption[] {
  const series: SeriesOption[] = [];
  const { markerSize } = formData;
  const { hideLine, name, opacity, showMarkers, style, width } = layer;
  const result = annotationData[name];
  if (isTimeseriesAnnotationResult(result)) {
    result.forEach(annotation => {
      const { key, values } = annotation;
      series.push({
        type: 'line',
        id: key,
        name: key,
        data: values.map(row => [row.x, row.y] as [OptionName, number]),
        symbolSize: showMarkers ? markerSize : 0,
        lineStyle: {
          opacity: parseAnnotationOpacity(opacity),
          type: style as ZRLineType,
          width: hideLine ? 0 : width,
        },
      });
    });
  }
  return series;
}
