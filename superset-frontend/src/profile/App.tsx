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
import { hot } from 'react-hot-loader/root';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@superset-ui/core';
import { GlobalStyles } from 'src/GlobalStyles';
import App from 'src/profile/components/App';
import messageToastReducer from 'src/components/MessageToasts/reducers';
import { initEnhancer } from 'src/reduxUtils';
import setupApp from 'src/setup/setupApp';
import setupExtensions from 'src/setup/setupExtensions';
import { theme } from 'src/preamble';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';
import getBootstrapData from 'src/utils/getBootstrapData';

setupApp();
setupExtensions();

const bootstrapData = getBootstrapData();

const store = createStore(
  combineReducers({
    messageToasts: messageToastReducer,
  }),
  {},
  compose(applyMiddleware(thunk), initEnhancer(false)),
);

const Application = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <App user={bootstrapData.user} />
      <ToastContainer />
    </ThemeProvider>
  </Provider>
);

export default hot(Application);
