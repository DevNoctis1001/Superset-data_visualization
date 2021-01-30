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
  DataRecord,
  QueryFormData,
  SetExtraFormDataHook,
} from '@superset-ui/core';
import { RefObject } from 'react';
import { AntdPluginFilterStylesProps } from '../types';

interface AntdPluginFilterSelectCustomizeProps {
  max?: number;
  min?: number;
}

export type PluginFilterRangeQueryFormData = QueryFormData &
  AntdPluginFilterStylesProps &
  AntdPluginFilterSelectCustomizeProps;

export type AntdPluginFilterRangeProps = AntdPluginFilterStylesProps & {
  data: DataRecord[];
  formData: PluginFilterRangeQueryFormData;
  setExtraFormData: SetExtraFormDataHook;
  inputRef: RefObject<any>;
};
