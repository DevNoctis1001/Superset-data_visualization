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
import { getChartAlias, Slice } from 'cypress/utils/vizPlugins';

export * from './vizPlugins';
export { default as parsePostForm } from './parsePostForm';
export interface ChartSpec {
    name: string;
    viz: string;
  }

export function setGridMode(type: 'card' | 'list') {
  cy.get(`[aria-label="${type}-view"]`).click();
}

export function toggleBulkSelect() {
  cy.getBySel('bulk-select').click();
}

export function clearAllInputs() {
    cy.get('[aria-label="close-circle"]').click({ multiple: true, force: true });
}

  const toSlicelike = ($chart: JQuery<HTMLElement>): Slice => ({
    slice_id: parseInt($chart.attr('data-test-chart-id')!, 10),
    form_data: {
      viz_type: $chart.attr('data-test-viz-type')!,
    },
  });

  export function getChartAliasBySpec(chart: ChartSpec) {
    return getChartGridComponent(chart).then($chart =>
      cy.wrap(getChartAlias(toSlicelike($chart))),
    );
  }

  export function getChartAliasesBySpec(charts: readonly ChartSpec[]) {
    const aliases: string[] = [];
    charts.forEach(chart =>
      getChartAliasBySpec(chart).then(alias => {
        aliases.push(alias);
      }),
    );
    // Wrapping the aliases is key.
    // That way callers can chain off this function
    // and actually get the list of aliases.
    return cy.wrap(aliases);
  }

export function getChartGridComponent({ name, viz }: ChartSpec) {
    return cy
      .get(`[data-test-chart-name="${name}"]`)
      .should('have.attr', 'data-test-viz-type', viz);
  }

export function waitForChartLoad(chart: ChartSpec) {
    return getChartGridComponent(chart).then(gridComponent => {
      const chartId = gridComponent.attr('data-test-chart-id');
      // the chart should load in under half a minute
      return (
        cy
          // this id only becomes visible when the chart is loaded
          .get(`#chart-id-${chartId}`, {
            timeout: 30000,
          })
          .should('be.visible')
          // return the chart grid component
          .then(() => gridComponent)
      );
    });
  }

