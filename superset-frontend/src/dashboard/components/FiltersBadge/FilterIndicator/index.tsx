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

import React, { FC } from 'react';
import { css } from '@superset-ui/core';
import Icons from 'src/components/Icons';
import { getFilterValueForDisplay } from 'src/dashboard/components/nativeFilters/FilterBar/FilterSets/utils';
import {
  FilterValue,
  FilterItem,
  FilterName,
} from 'src/dashboard/components/FiltersBadge/Styles';
import { Indicator } from 'src/dashboard/components/nativeFilters/selectors';

export interface IndicatorProps {
  indicator: Indicator;
  onClick?: (path: string[]) => void;
}

const FilterIndicator: FC<IndicatorProps> = ({
  indicator: { column, name, value, path = [] },
  onClick,
}) => {
  const resultValue = getFilterValueForDisplay(value);
  return (
    <FilterItem
      onClick={
        onClick ? () => onClick([...path, `LABEL-${column}`]) : undefined
      }
    >
      {onClick && (
        <i>
          <Icons.SearchOutlined
            data-test="cross-filter-lens"
            iconSize="m"
            css={css`
              span {
                vertical-align: 0;
              }
            `}
          />
        </i>
      )}
      <div>
        <FilterName data-test="cross-filter-name">
          {name}
          {resultValue ? ': ' : ''}
        </FilterName>
        <FilterValue data-test="cross-filter-value">{resultValue}</FilterValue>
      </div>
    </FilterItem>
  );
};

export default FilterIndicator;
