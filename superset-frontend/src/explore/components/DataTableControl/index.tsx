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
import React, { useCallback, useMemo } from 'react';
import {
  css,
  GenericDataType,
  getTimeFormatter,
  styled,
  t,
  TimeFormats,
  useTheme,
} from '@superset-ui/core';
import { Global } from '@emotion/react';
import { Column } from 'react-table';
import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import { Space } from 'src/components';
import { Input } from 'src/components/Input';
import {
  BOOL_FALSE_DISPLAY,
  BOOL_TRUE_DISPLAY,
  NULL_DISPLAY,
  SLOW_DEBOUNCE,
} from 'src/constants';
import { Radio } from 'src/components/Radio';
import Icons from 'src/components/Icons';
import Button from 'src/components/Button';
import Popover from 'src/components/Popover';
import { prepareCopyToClipboardTabularData } from 'src/utils/common';
import CopyToClipboard from 'src/components/CopyToClipboard';
import RowCountLabel from 'src/explore/components/RowCountLabel';
import {
  setOriginalFormattedTimeColumn,
  unsetOriginalFormattedTimeColumn,
} from 'src/explore/actions/exploreActions';

export const CellNull = styled('span')`
  color: ${({ theme }) => theme.colors.grayscale.light1};
`;

export const CopyButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;

  // needed to override button's first-of-type margin: 0
  && {
    margin: 0 ${({ theme }) => theme.gridUnit * 2}px;
  }

  i {
    padding: 0 ${({ theme }) => theme.gridUnit}px;
  }
`;

export const CopyToClipboardButton = ({
  data,
  columns,
}: {
  data?: Record<string, any>;
  columns?: string[];
}) => {
  const theme = useTheme();
  return (
    <CopyToClipboard
      text={
        data && columns ? prepareCopyToClipboardTabularData(data, columns) : ''
      }
      wrapped={false}
      copyNode={
        <Icons.CopyOutlined
          iconColor={theme.colors.grayscale.base}
          iconSize="l"
          aria-label={t('Copy')}
          role="button"
          css={css`
            &.anticon > * {
              line-height: 0;
            }
          `}
        />
      }
    />
  );
};

export const FilterInput = ({
  onChangeHandler,
}: {
  onChangeHandler(filterText: string): void;
}) => {
  const theme = useTheme();
  const debouncedChangeHandler = debounce(onChangeHandler, SLOW_DEBOUNCE);
  return (
    <Input
      prefix={<Icons.Search iconColor={theme.colors.grayscale.base} />}
      placeholder={t('Search')}
      onChange={(event: any) => {
        const filterText = event.target.value;
        debouncedChangeHandler(filterText);
      }}
      css={css`
        width: 200px;
        margin-right: ${theme.gridUnit * 2}px;
      `}
    />
  );
};

export const RowCount = ({
  data,
  loading,
}: {
  data?: Record<string, any>[];
  loading: boolean;
}) => <RowCountLabel rowcount={data?.length ?? 0} loading={loading} />;

enum FormatPickerValue {
  Formatted,
  Original,
}

const FormatPicker = ({
  onChange,
  value,
}: {
  onChange: any;
  value: FormatPickerValue;
}) => (
  <Radio.Group value={value} onChange={onChange}>
    <Space direction="vertical">
      <Radio value={FormatPickerValue.Formatted}>{t('Formatted date')}</Radio>
      <Radio value={FormatPickerValue.Original}>{t('Original value')}</Radio>
    </Space>
  </Radio.Group>
);

const FormatPickerContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => `${theme.gridUnit * 4}px`};
`;

const FormatPickerLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
  text-transform: uppercase;
`;

const DataTableTemporalHeaderCell = ({
  columnName,
  datasourceId,
  originalFormattedTimeColumnIndex,
}: {
  columnName: string;
  datasourceId?: string;
  originalFormattedTimeColumnIndex: number;
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isTimeColumnOriginalFormatted = originalFormattedTimeColumnIndex > -1;

  const onChange = useCallback(
    e => {
      if (!datasourceId) {
        return;
      }
      if (
        e.target.value === FormatPickerValue.Original &&
        !isTimeColumnOriginalFormatted
      ) {
        dispatch(setOriginalFormattedTimeColumn(datasourceId, columnName));
      } else if (
        e.target.value === FormatPickerValue.Formatted &&
        isTimeColumnOriginalFormatted
      ) {
        dispatch(
          unsetOriginalFormattedTimeColumn(
            datasourceId,
            originalFormattedTimeColumnIndex,
          ),
        );
      }
    },
    [
      originalFormattedTimeColumnIndex,
      columnName,
      datasourceId,
      dispatch,
      isTimeColumnOriginalFormatted,
    ],
  );
  const overlayContent = useMemo(
    () =>
      datasourceId ? ( // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <FormatPickerContainer onClick={e => e.stopPropagation()}>
          {/* hack to disable click propagation from popover content to table header, which triggers sorting column */}
          <Global
            styles={css`
              .column-formatting-popover .ant-popover-inner-content {
                padding: 0;
              }
            `}
          />
          <FormatPickerLabel>{t('Column Formatting')}</FormatPickerLabel>
          <FormatPicker
            onChange={onChange}
            value={
              isTimeColumnOriginalFormatted
                ? FormatPickerValue.Original
                : FormatPickerValue.Formatted
            }
          />
        </FormatPickerContainer>
      ) : null,
    [datasourceId, isTimeColumnOriginalFormatted, onChange],
  );

  return datasourceId ? (
    <span>
      <Popover
        overlayClassName="column-formatting-popover"
        trigger="click"
        content={overlayContent}
        placement="bottomLeft"
        arrowPointAtCenter
      >
        <Icons.SettingOutlined
          iconSize="m"
          iconColor={theme.colors.grayscale.light1}
          css={{ marginRight: `${theme.gridUnit}px` }}
          onClick={e => e.stopPropagation()}
        />
      </Popover>
      {columnName}
    </span>
  ) : (
    <span>{columnName}</span>
  );
};

export const useFilteredTableData = (
  filterText: string,
  data?: Record<string, any>[],
) => {
  const rowsAsStrings = useMemo(
    () =>
      data?.map((row: Record<string, any>) =>
        Object.values(row).map(value =>
          value ? value.toString().toLowerCase() : t('N/A'),
        ),
      ) ?? [],
    [data],
  );

  return useMemo(() => {
    if (!data?.length) {
      return [];
    }
    return data.filter((_, index: number) =>
      rowsAsStrings[index].some(value =>
        value?.includes(filterText.toLowerCase()),
      ),
    );
  }, [data, filterText, rowsAsStrings]);
};

const timeFormatter = getTimeFormatter(TimeFormats.DATABASE_DATETIME);

export const useTableColumns = (
  colnames?: string[],
  coltypes?: GenericDataType[],
  data?: Record<string, any>[],
  datasourceId?: string,
  originalFormattedTimeColumns: string[] = [],
  moreConfigs?: { [key: string]: Partial<Column> },
) =>
  useMemo(
    () =>
      colnames && data?.length
        ? colnames
            .filter((column: string) => Object.keys(data[0]).includes(column))
            .map((key, index) => {
              const colType = coltypes?.[index];
              const firstValue = data[0][key];
              const originalFormattedTimeColumnIndex =
                colType === GenericDataType.TEMPORAL
                  ? originalFormattedTimeColumns.indexOf(key)
                  : -1;
              return {
                id: key,
                accessor: row => row[key],
                // When the key is empty, have to give a string of length greater than 0
                Header:
                  colType === GenericDataType.TEMPORAL &&
                  typeof firstValue !== 'string' ? (
                    <DataTableTemporalHeaderCell
                      columnName={key}
                      datasourceId={datasourceId}
                      originalFormattedTimeColumnIndex={
                        originalFormattedTimeColumnIndex
                      }
                    />
                  ) : (
                    key
                  ),
                Cell: ({ value }) => {
                  if (value === true) {
                    return BOOL_TRUE_DISPLAY;
                  }
                  if (value === false) {
                    return BOOL_FALSE_DISPLAY;
                  }
                  if (value === null) {
                    return <CellNull>{NULL_DISPLAY}</CellNull>;
                  }
                  if (
                    colType === GenericDataType.TEMPORAL &&
                    originalFormattedTimeColumnIndex === -1 &&
                    typeof value === 'number'
                  ) {
                    return timeFormatter(value);
                  }
                  return String(value);
                },
                ...moreConfigs?.[key],
              } as Column;
            })
        : [],
    [
      colnames,
      data,
      coltypes,
      datasourceId,
      moreConfigs,
      originalFormattedTimeColumns,
    ],
  );
