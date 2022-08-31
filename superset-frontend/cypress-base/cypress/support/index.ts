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
import '@cypress/code-coverage/support';
import '@applitools/eyes-cypress/commands';

require('cy-verify-downloads').addCustomCommand();

const BASE_EXPLORE_URL = '/explore/?form_data=';
const TokenName = Cypress.env('TOKEN_NAME');
let SAMPLE_DASHBOARDS: Record<string, any>[] = [];
let SAMPLE_CHARTS: Record<string, any>[] = [];

function resetSamples() {
  cy.login();
  cy.fixture('dashboards.json').then(dashboards => {
    dashboards.forEach((d: { dashboard_title: string }) => {
      cy.deleteDashboardByName(d.dashboard_title, false);
    });
  });
  cy.fixture('charts.json').then(charts => {
    charts.forEach((c: { slice_name: string }) => {
      cy.deleteChartByName(c.slice_name, false);
    });
  });
}

function loadSampleData() {
  cy.login();
  cy.getCharts().then((slices: any) => {
    SAMPLE_CHARTS = slices;
  });
  cy.getDashboards().then((dashboards: any) => {
    SAMPLE_DASHBOARDS = dashboards;
  });
}

before(() => {
  loadSampleData();
});

beforeEach(() => {
  resetSamples();
});

Cypress.Commands.add('getBySel', (selector, ...args) =>
  cy.get(`[data-test=${selector}]`, ...args),
);

Cypress.Commands.add('getBySelLike', (selector, ...args) =>
  cy.get(`[data-test*=${selector}]`, ...args),
);

/* eslint-disable consistent-return */
Cypress.on('uncaught:exception', err => {
  // ignore ResizeObserver client errors, as they are unrelated to operation
  // and causing flaky test failures in CI
  if (err.message && /ResizeObserver loop limit exceeded/.test(err.message)) {
    // returning false here prevents Cypress from failing the test
    return false;
  }
});
/* eslint-enable consistent-return */

Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: '/login/',
    body: { username: 'admin', password: 'general' },
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('preserveLogin', () => {
  Cypress.Cookies.preserveOnce('session');
});

Cypress.Commands.add('visitChartByName', name => {
  cy.request(`/chart/api/read?_flt_3_slice_name=${name}`).then(response => {
    cy.visit(`${BASE_EXPLORE_URL}{"slice_id": ${response.body.pks[0]}}`);
  });
});

Cypress.Commands.add('visitChartById', chartId =>
  cy.visit(`${BASE_EXPLORE_URL}{"slice_id": ${chartId}}`),
);

Cypress.Commands.add(
  'visitChartByParams',
  (formData: {
    datasource?: string;
    datasource_id?: number;
    datasource_type?: string;
    [key: string]: unknown;
  }) => {
    let datasource_id;
    let datasource_type;
    if (formData.datasource_id && formData.datasource_type) {
      ({ datasource_id, datasource_type } = formData);
    } else {
      [datasource_id, datasource_type] = formData.datasource?.split('__') || [];
    }
    const accessToken = window.localStorage.getItem('access_token');
    cy.request({
      method: 'POST',
      url: 'api/v1/explore/form_data',
      body: {
        datasource_id,
        datasource_type,
        form_data: JSON.stringify(formData),
      },
      headers: {
        ...(accessToken && {
          Cookie: `csrf_access_token=${accessToken}`,
          'X-CSRFToken': accessToken,
        }),
        ...(TokenName && { Authorization: `Bearer ${TokenName}` }),
        'Content-Type': 'application/json',
        Referer: `${Cypress.config().baseUrl}/`,
      },
    }).then(response => {
      const formDataKey = response.body.key;
      const url = `/explore/?form_data_key=${formDataKey}`;
      cy.visit(url);
    });
  },
);

Cypress.Commands.add('verifySliceContainer', chartSelector => {
  // After a wait response check for valid slice container
  cy.get('.slice_container')
    .should('be.visible')
    .within(() => {
      if (chartSelector) {
        cy.get(chartSelector)
          .should('be.visible')
          .then(chart => {
            expect(chart[0].clientWidth).greaterThan(0);
            expect(chart[0].clientHeight).greaterThan(0);
          });
      }
    });
  return cy;
});

Cypress.Commands.add(
  'verifySliceSuccess',
  ({
    waitAlias,
    querySubstring,
    chartSelector,
  }: {
    waitAlias: string;
    chartSelector: JQuery.Selector;
    querySubstring?: string | RegExp;
  }) => {
    cy.wait(waitAlias).then(({ response }) => {
      cy.verifySliceContainer(chartSelector);
      const responseBody = response?.body;
      if (querySubstring) {
        const query: string =
          responseBody.query || responseBody.result[0].query || '';
        if (querySubstring instanceof RegExp) {
          expect(query).to.match(querySubstring);
        } else {
          expect(query).to.contain(querySubstring);
        }
      }
    });
    return cy;
  },
);

Cypress.Commands.add('createSampleDashboards', () => {
  const requests: any = [];
  cy.fixture('dashboards.json').then(dashboards => {
    for (let i = 0; i < dashboards.length; i += 1) {
      requests.push(
        cy.request({
          method: 'POST',
          url: `/api/v1/dashboard/`,
          body: dashboards[i],
          headers: {
            Cookie: `csrf_access_token=${window.localStorage.getItem(
              'access_token',
            )}`,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TokenName}`,
            'X-CSRFToken': `${window.localStorage.getItem('access_token')}`,
            Referer: `${Cypress.config().baseUrl}/`,
          },
        }),
      );
    }
    return Promise.all(requests).then(() => loadSampleData());
  });
});

Cypress.Commands.add('createSampleCharts', () => {
  const requests: any = [];
  return cy.fixture('charts.json').then(charts => {
    for (let i = 0; i < charts.length; i += 1) {
      requests.push(
        cy.request({
          method: 'POST',
          url: `/api/v1/chart/`,
          body: charts[i],
          headers: {
            Cookie: `csrf_access_token=${window.localStorage.getItem(
              'access_token',
            )}`,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TokenName}`,
            'X-CSRFToken': `${window.localStorage.getItem('access_token')}`,
            Referer: `${Cypress.config().baseUrl}/`,
          },
        }),
      );
    }
    return Promise.all(requests).then(() => loadSampleData());
  });
});

Cypress.Commands.add(
  'deleteDashboardByName',
  (dashboardName: string, failOnStatusCode: boolean) => {
    const dashboard = SAMPLE_DASHBOARDS.find(
      d => d.dashboard_title === dashboardName,
    );
    if (dashboard) {
      cy.deleteDashboard(dashboard.id, failOnStatusCode);
    }
  },
);

Cypress.Commands.add('deleteDashboard', (id: number, failOnStatusCode = true) =>
  cy
    .request({
      failOnStatusCode,
      method: 'DELETE',
      url: `api/v1/dashboard/${id}`,
      headers: {
        Cookie: `csrf_access_token=${window.localStorage.getItem(
          'access_token',
        )}`,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenName}`,
        'X-CSRFToken': `${window.localStorage.getItem('access_token')}`,
        Referer: `${Cypress.config().baseUrl}/`,
      },
    })
    .then(resp => resp),
);

Cypress.Commands.add('getDashboards', () =>
  cy
    .request({
      method: 'GET',
      url: `api/v1/dashboard/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenName}`,
      },
    })
    .then(resp => resp.body.result),
);

Cypress.Commands.add('deleteChart', (id: number, failOnStatusCode = true) =>
  cy
    .request({
      failOnStatusCode,
      method: 'DELETE',
      url: `api/v1/chart/${id}`,
      headers: {
        Cookie: `csrf_access_token=${window.localStorage.getItem(
          'access_token',
        )}`,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenName}`,
        'X-CSRFToken': `${window.localStorage.getItem('access_token')}`,
        Referer: `${Cypress.config().baseUrl}/`,
      },
    })
    .then(resp => resp),
);

Cypress.Commands.add('getCharts', () =>
  cy
    .request({
      method: 'GET',
      url: `api/v1/chart/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenName}`,
      },
    })
    .then(resp => resp.body.result),
);

Cypress.Commands.add(
  'deleteChartByName',
  (sliceName: string, failOnStatusCode: boolean) => {
    const chart = SAMPLE_CHARTS.find(c => c.slice_name === sliceName);
    if (chart) {
      cy.deleteChart(chart.id, failOnStatusCode);
    }
  },
);
