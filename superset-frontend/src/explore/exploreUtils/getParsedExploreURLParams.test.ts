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

import { getParsedExploreURLParams } from './getParsedExploreURLParams';

const EXPLORE_BASE_URL = 'http://localhost:9000/superset/explore/';
const setupLocation = (newUrl: string) => {
  delete (window as any).location;
  // @ts-ignore
  window.location = new URL(newUrl);
};

test('get form_data_key and slice_id from search params - url when moving from dashboard to explore', () => {
  setupLocation(
    `${EXPLORE_BASE_URL}?form_data_key=yrLXmyE9fmhQ11lM1KgaD1PoPSBpuLZIJfqdyIdw9GoBwhPFRZHeIgeFiNZljbpd&slice_id=56`,
  );
  expect(getParsedExploreURLParams()).toEqual(
    'slice_id=56&form_data_key=yrLXmyE9fmhQ11lM1KgaD1PoPSBpuLZIJfqdyIdw9GoBwhPFRZHeIgeFiNZljbpd',
  );
});

test('get slice_id from form_data search param - url on Chart List', () => {
  setupLocation(`${EXPLORE_BASE_URL}?form_data=%7B%22slice_id%22%3A%2056%7D`);
  expect(getParsedExploreURLParams()).toEqual('slice_id=56');
});

test('get permalink key from path params', () => {
  setupLocation(`${EXPLORE_BASE_URL}p/kpOqweaMY9R/`);
  expect(getParsedExploreURLParams()).toEqual('permalink_key=kpOqweaMY9R');
});
