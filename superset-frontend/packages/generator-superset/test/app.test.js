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

/* eslint-disable jest/expect-expect */

const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const appModule = require('../generators/app');

test('generator-superset:app:creates files', () =>
  helpers
    .run(appModule)
    .withPrompts({
      subgenerator: 'package',
      name: 'my-package',
    })
    .then(function () {
      assert.file([
        'package.json',
        'README.md',
        'src/index.ts',
        'test/index.test.ts',
      ]);
    }));
