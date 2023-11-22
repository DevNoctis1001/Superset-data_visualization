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

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { isEqual, isEmpty } from 'lodash';
import { styled, t } from '@superset-ui/core';
import { sanitizeFormData } from 'src/explore/exploreUtils/formData';
import getControlsForVizType from 'src/utils/getControlsForVizType';
import { safeStringify } from 'src/utils/safeStringify';
import { Tooltip } from 'src/components/Tooltip';
import ModalTrigger from '../ModalTrigger';
import TableView from '../TableView';

const propTypes = {
  origFormData: PropTypes.object.isRequired,
  currentFormData: PropTypes.object.isRequired,
};

const StyledLabel = styled.span`
  ${({ theme }) => `
    font-size: ${theme.typography.sizes.s}px;
    color: ${theme.colors.grayscale.dark1};
    background-color: ${theme.colors.alert.base};

    &: hover {
      background-color: ${theme.colors.alert.dark1};
    }
  `}
`;

function alterForComparison(value) {
  // Considering `[]`, `{}`, `null` and `undefined` as identical
  // for this purpose
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'object') {
    if (Array.isArray(value) && value.length === 0) {
      return null;
    }
    const keys = Object.keys(value);
    if (keys && keys.length === 0) {
      return null;
    }
  }
  return value;
}

const AlteredSliceTag = (props) => {
const diffs = getDiffsHandler(props);
    const controlsMap = getControlsForVizType(props.origFormData.viz_type);
    const rows = getRowsFromDiffsHandler(diffs, controlsMap);

    const [hasDiffs, setHasDiffs] = useState(!isEmpty(diffs));

    const UNSAFE_componentWillReceivePropsHandler = useCallback((newProps) => {
    // Update differences if need be
    if (isEqual(props, newProps)) {
      return;
    }
    const diffs = getDiffsHandler(newProps);
    setStateHandler(prevState => ({
      rows: getRowsFromDiffsHandler(diffs, prevState.controlsMap),
      hasDiffs: !isEmpty(diffs),
    }));
  }, []);
    const getRowsFromDiffsHandler = useCallback((diffs, controlsMap) => {
    return Object.entries(diffs).map(([key, diff]) => ({
      control: (controlsMap[key] && controlsMap[key].label) || key,
      before: formatValueHandler(diff.before, key, controlsMap),
      after: formatValueHandler(diff.after, key, controlsMap),
    }));
  }, []);
    const getDiffsHandler = useCallback((props) => {
    // Returns all properties that differ in the
    // current form data and the saved form data
    const ofd = sanitizeFormData(props.origFormData);
    const cfd = sanitizeFormData(props.currentFormData);

    const fdKeys = Object.keys(cfd);
    const diffs = {};
    fdKeys.forEach(fdKey => {
      if (!ofd[fdKey] && !cfd[fdKey]) {
        return;
      }
      if (['filters', 'having', 'where'].includes(fdKey)) {
        return;
      }
      if (!isEqualishHandler(ofd[fdKey], cfd[fdKey])) {
        diffs[fdKey] = { before: ofd[fdKey], after: cfd[fdKey] };
      }
    });
    return diffs;
  }, []);
    const isEqualishHandler = useCallback((val1, val2) => {
    return isEqual(alterForComparison(val1), alterForComparison(val2));
  }, []);
    const formatValueHandler = useCallback((value, key, controlsMap) => {
    // Format display value based on the control type
    // or the value type
    if (value === undefined) {
      return 'N/A';
    }
    if (value === null) {
      return 'null';
    }
    if (controlsMap[key]?.type === 'AdhocFilterControl') {
      if (!value.length) {
        return '[]';
      }
      return value
        .map(v => {
          const filterVal =
            v.comparator && v.comparator.constructor === Array
              ? `[${v.comparator.join(', ')}]`
              : v.comparator;
          return `${v.subject} ${v.operator} ${filterVal}`;
        })
        .join(', ');
    }
    if (controlsMap[key]?.type === 'BoundsControl') {
      return `Min: ${value[0]}, Max: ${value[1]}`;
    }
    if (controlsMap[key]?.type === 'CollectionControl') {
      return value.map(v => safeStringify(v)).join(', ');
    }
    if (
      controlsMap[key]?.type === 'MetricsControl' &&
      value.constructor === Array
    ) {
      const formattedValue = value.map(v => v?.label ?? v);
      return formattedValue.length ? formattedValue.join(', ') : '[]';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (value.constructor === Array) {
      const formattedValue = value.map(v => v?.label ?? v);
      return formattedValue.length ? formattedValue.join(', ') : '[]';
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    return safeStringify(value);
  }, []);
    const renderModalBodyHandler = useCallback(() => {
    const columns = [
      {
        accessor: 'control',
        Header: t('Control'),
      },
      {
        accessor: 'before',
        Header: t('Before'),
      },
      {
        accessor: 'after',
        Header: t('After'),
      },
    ];
    // set the wrap text in the specific columns.
    const columnsForWrapText = ['Control', 'Before', 'After'];

    return (
      <TableView
        columns={columns}
        data={rows}
        pageSize={50}
        className="table-condensed"
        columnsForWrapText={columnsForWrapText}
      />
    );
  }, []);
    const renderTriggerNodeHandler = useCallback(() => {
    return (
      <Tooltip id="difference-tooltip" title={t('Click to see difference')}>
        <StyledLabel className="label">{t('Altered')}</StyledLabel>
      </Tooltip>
    );
  }, []);

    if (!hasDiffs) {
      return null;
    }
    // Render the label-warning 'Altered' tag which the user may
    // click to open a modal containing a table summarizing the
    // differences in the slice
    return (
      <ModalTrigger
        triggerNode={renderTriggerNodeHandler()}
        modalTitle={t('Chart changes')}
        modalBody={renderModalBodyHandler()}
        responsive
      />
    ); 
};

export default AlteredSliceTag;




AlteredSliceTag.propTypes = propTypes;
