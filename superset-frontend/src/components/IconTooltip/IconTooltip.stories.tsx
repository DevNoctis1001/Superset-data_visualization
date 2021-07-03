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
import Icons from 'src/components/Icons';
import { IconTooltip, Props } from '.';

export default {
  title: 'IconTooltip',
};

const PLACEMENTS = [
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftBottom',
  'leftTop',
  'right',
  'rightBottom',
  'rightTop',
  'top',
  'topLeft',
  'topRight',
];

export const InteractiveIconTooltip = (args: Props) => (
  <div css={{ margin: '40px 70px' }}>
    <IconTooltip {...args}>
      <Icons.Info />
    </IconTooltip>
  </div>
);

InteractiveIconTooltip.args = {
  tooltip: 'Tooltip',
};

InteractiveIconTooltip.argTypes = {
  placement: {
    defaultValue: 'top',
    control: { type: 'select', options: PLACEMENTS },
  },
};

InteractiveIconTooltip.story = {
  parameters: {
    knobs: {
      disable: true,
    },
  },
};
