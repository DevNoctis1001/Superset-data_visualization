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
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import shortid from 'shortid';
import getToastsFromPyFlashMessages from 'src/components/MessageToasts/getToastsFromPyFlashMessages';
import logger from 'src/middleware/loggerMiddleware';
import { initFeatureFlags } from 'src/featureFlags';
import { initEnhancer } from 'src/reduxUtils';
import rootReducer from './reducers/index';
import App from './App';

const exploreViewContainer = document.getElementById('app');
const bootstrapData = JSON.parse(
  exploreViewContainer.getAttribute('data-bootstrap'),
);

const user = { ...bootstrapData.user };
const common = { ...bootstrapData.common };
initFeatureFlags(common.feature_flags);
const store = createStore(
  rootReducer,
  {
    user,
    common,
    impressionId: shortid.generate(),
    messageToasts: getToastsFromPyFlashMessages(common?.flash_messages || []),
  },
  compose(applyMiddleware(thunk, logger), initEnhancer(false)),
);

ReactDOM.render(<App store={store} />, document.getElementById('app'));
