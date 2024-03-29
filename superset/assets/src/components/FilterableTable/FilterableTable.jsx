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
import { List } from 'immutable';
import PropTypes from 'prop-types';
import JSONbig from 'json-bigint';
import React, { PureComponent } from 'react';
import JSONTree from 'react-json-tree';
import {
  Column,
  Grid,
  ScrollSync,
  SortDirection,
  SortIndicator,
  Table,
} from 'react-virtualized';
import { getTextDimension } from '@superset-ui/dimension';
import { t } from '@superset-ui/translation';

import Button from '../Button';
import CopyToClipboard from '../CopyToClipboard';
import ModalTrigger from '../ModalTrigger';
import TooltipWrapper from '../TooltipWrapper';

function getTextWidth(text, font = '12px Roboto') {
  return getTextDimension({ text, style: { font } }).width;
}

function safeJsonObjectParse(data) {
  // First perform a cheap proxy to avoid calling JSON.parse on data that is clearly not a
  // JSON object or array
  if (typeof data !== 'string' || ['{', '['].indexOf(data.substring(0, 1)) === -1) {
    return null;
  }

  // We know `data` is a string starting with '{' or '[', so try to parse it as a valid object
  try {
    const jsonData = JSON.parse(data);
    if (jsonData && typeof jsonData === 'object') {
      return jsonData;
    }
    return null;
  } catch (_) {
    return null;
  }
}

const SCROLL_BAR_HEIGHT = 15;
const GRID_POSITION_ADJUSTMENT = 4;
const JSON_TREE_THEME = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};


// when more than MAX_COLUMNS_FOR_TABLE are returned, switch from table to grid view
export const MAX_COLUMNS_FOR_TABLE = 50;

const propTypes = {
  orderedColumnKeys: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  filterText: PropTypes.string,
  headerHeight: PropTypes.number,
  overscanColumnCount: PropTypes.number,
  overscanRowCount: PropTypes.number,
  rowHeight: PropTypes.number,
  striped: PropTypes.bool,
  expandedColumns: PropTypes.array,
};

const defaultProps = {
  filterText: '',
  headerHeight: 32,
  overscanColumnCount: 10,
  overscanRowCount: 10,
  rowHeight: 32,
  striped: true,
  expandedColumns: [],
};

export default class FilterableTable extends PureComponent {
  constructor(props) {
    super(props);
    this.list = List(this.formatTableData(props.data));
    this.addJsonModal = this.addJsonModal.bind(this);
    this.getCellContent = this.getCellContent.bind(this);
    this.renderGridCell = this.renderGridCell.bind(this);
    this.renderGridCellHeader = this.renderGridCellHeader.bind(this);
    this.renderGrid = this.renderGrid.bind(this);
    this.renderTableCell = this.renderTableCell.bind(this);
    this.renderTableHeader = this.renderTableHeader.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.rowClassName = this.rowClassName.bind(this);
    this.sort = this.sort.bind(this);

    // columns that have complex type and were expanded into sub columns
    this.complexColumns = props.orderedColumnKeys
      .reduce((obj, key) => ({
        ...obj,
        [key]: props.expandedColumns.some(name => name.startsWith(key + '.')),
      }), {});

    this.widthsForColumnsByKey = this.getWidthsForColumns();
    this.totalTableWidth = props.orderedColumnKeys
      .map(key => this.widthsForColumnsByKey[key])
      .reduce((curr, next) => curr + next);
    this.totalTableHeight = props.height;

    this.state = {
      sortBy: null,
      sortDirection: SortDirection.ASC,
      fitted: false,
    };

    this.container = React.createRef();
  }

  componentDidMount() {
    this.fitTableToWidthIfNeeded();
  }

  getDatum(list, index) {
    return list.get(index % list.size);
  }

  getWidthsForColumns() {
    const PADDING = 40; // accounts for cell padding and width of sorting icon
    const widthsByColumnKey = {};
    this.props.orderedColumnKeys.forEach((key) => {
      const colWidths = this.list
        // get width for each value for a key
        .map(d => getTextWidth(
          this.getCellContent({ cellData: d[key], columnKey: key })) + PADDING,
        )
        // add width of column key to end of list
        .push(getTextWidth(key) + PADDING);
      // set max width as value for key
      widthsByColumnKey[key] = Math.max(...colWidths);
    });
    return widthsByColumnKey;
  }

  getCellContent({ cellData, columnKey }) {
    const content = String(cellData);
    const firstCharacter = content.substring(0, 1);
    let truncated;
    if (firstCharacter === '[') {
      truncated = '[…]';
    } else if (firstCharacter === '{') {
      truncated = '{…}';
    } else {
      truncated = '';
    }
    return this.complexColumns[columnKey] ? truncated : content;
  }

  formatTableData(data) {
    const formattedData = data.map((row) => {
      const newRow = {};
      for (const k in row) {
        const val = row[k];
        if (['string', 'number'].indexOf(typeof (val)) >= 0) {
          newRow[k] = val;
        } else {
          newRow[k] = JSONbig.stringify(val);
        }
      }
      return newRow;
    });
    return formattedData;
  }

  hasMatch(text, row) {
    const values = [];
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        const cellValue = row[key];
        if (typeof cellValue === 'string') {
          values.push(cellValue.toLowerCase());
        } else if (cellValue !== null && typeof cellValue.toString === 'function') {
          values.push(cellValue.toString());
        }
      }
    }
    const lowerCaseText = text.toLowerCase();
    return values.some(v => v.includes(lowerCaseText));
  }

  rowClassName({ index }) {
    let className = '';
    if (this.props.striped) {
      className = index % 2 === 0 ? 'even-row' : 'odd-row';
    }
    return className;
  }

  sort({ sortBy, sortDirection }) {
    this.setState({ sortBy, sortDirection });
  }

  fitTableToWidthIfNeeded() {
    const containerWidth = this.container.clientWidth;
    if (this.totalTableWidth < containerWidth) {
      // fit table width if content doesn't fill the width of the container
      this.totalTableWidth = containerWidth;
    }
    this.setState({ fitted: true });
  }

  addJsonModal(node, jsonObject, jsonString) {
    return (
      <ModalTrigger
        modalBody={<JSONTree data={jsonObject} theme={JSON_TREE_THEME} />}
        modalFooter={<Button><CopyToClipboard shouldShowText={false} text={jsonString} /></Button>}
        modalTitle={t('Cell Content')}
        triggerNode={node}
      />
    );
  }

  renderTableHeader({ dataKey, label, sortBy, sortDirection }) {
    const className = this.props.expandedColumns.indexOf(label) > -1
      ? 'header-style-disabled'
      : 'header-style';
    return (
      <TooltipWrapper label="header" tooltip={label}>
        <div className={className}>
          {label}
          {sortBy === dataKey &&
            <SortIndicator sortDirection={sortDirection} />
          }
        </div>
      </TooltipWrapper>
    );
  }

  renderGridCellHeader({ columnIndex, key, style }) {
    const label = this.props.orderedColumnKeys[columnIndex];
    const className = this.props.expandedColumns.indexOf(label) > -1
      ? 'header-style-disabled'
      : 'header-style';
    return (
      <TooltipWrapper key={key} label="header" tooltip={label}>
        <div
          style={{ ...style, top: style.top - GRID_POSITION_ADJUSTMENT }}
          className={`${className} grid-cell grid-header-cell`}
        >
          {label}
        </div>
      </TooltipWrapper>
    );
  }

  renderGridCell({ columnIndex, key, rowIndex, style }) {
    const columnKey = this.props.orderedColumnKeys[columnIndex];
    const cellData = this.list.get(rowIndex)[columnKey];
    const content = this.getCellContent({ cellData, columnKey });
    const cellNode = (
      <div
        key={key}
        style={{ ...style, top: style.top - GRID_POSITION_ADJUSTMENT }}
        className={`grid-cell ${this.rowClassName({ index: rowIndex })}`}
      >
        {content}
      </div>
    );

    const jsonObject = safeJsonObjectParse(cellData);
    if (jsonObject) {
      return this.addJsonModal(cellNode, jsonObject, cellData);
    }
    return cellNode;
  }

  renderGrid() {
    const { orderedColumnKeys, overscanColumnCount, overscanRowCount, rowHeight } = this.props;

    let { height } = this.props;
    let totalTableHeight = height;
    if (this.container && this.totalTableWidth > this.container.clientWidth) {
      // exclude the height of the horizontal scroll bar from the height of the table
      // and the height of the table container if the content overflows
      height -= SCROLL_BAR_HEIGHT;
      totalTableHeight -= SCROLL_BAR_HEIGHT;
    }

    const getColumnWidth = ({ index }) => this.widthsForColumnsByKey[orderedColumnKeys[index]];

    // fix height of filterable table
    return (
      <ScrollSync>
        {({ onScroll, scrollTop }) => (
          <div
            style={{ height }}
            className="filterable-table-container Table"
            ref={this.container}
          >
            <div className="LeftColumn">
              <Grid
                cellRenderer={this.renderGridCellHeader}
                columnCount={orderedColumnKeys.length}
                columnWidth={getColumnWidth}
                height={rowHeight}
                rowCount={1}
                rowHeight={rowHeight}
                scrollTop={scrollTop}
                width={this.totalTableWidth}
              />
            </div>
            <div className="RightColumn">
              <Grid
                cellRenderer={this.renderGridCell}
                columnCount={orderedColumnKeys.length}
                columnWidth={getColumnWidth}
                height={totalTableHeight - rowHeight}
                onScroll={onScroll}
                overscanColumnCount={overscanColumnCount}
                overscanRowCount={overscanRowCount}
                rowCount={this.list.size}
                rowHeight={rowHeight}
                width={this.totalTableWidth}
              />
            </div>
          </div>
        )}
      </ScrollSync>
    );
  }

  renderTableCell({ cellData, columnKey }) {
    const cellNode = this.getCellContent({ cellData, columnKey });
    const jsonObject = safeJsonObjectParse(cellData);
    if (jsonObject) {
      return this.addJsonModal(cellNode, jsonObject, cellData);
    }
    return cellNode;
  }

  renderTable() {
    const { sortBy, sortDirection } = this.state;
    const {
      filterText,
      headerHeight,
      orderedColumnKeys,
      overscanRowCount,
      rowHeight,
    } = this.props;

    let sortedAndFilteredList = this.list;
    // filter list
    if (filterText) {
      sortedAndFilteredList = this.list.filter(row => this.hasMatch(filterText, row));
    }
    // sort list
    if (sortBy) {
      sortedAndFilteredList = sortedAndFilteredList
      .sortBy(item => item[sortBy])
      .update(list => sortDirection === SortDirection.DESC ? list.reverse() : list);
    }

    let { height } = this.props;
    let totalTableHeight = height;
    if (this.container && this.totalTableWidth > this.container.clientWidth) {
      // exclude the height of the horizontal scroll bar from the height of the table
      // and the height of the table container if the content overflows
      height -= SCROLL_BAR_HEIGHT;
      totalTableHeight -= SCROLL_BAR_HEIGHT;
    }

    const rowGetter = ({ index }) => this.getDatum(sortedAndFilteredList, index);
    return (
      <div
        style={{ height }}
        className="filterable-table-container"
        ref={this.container}
      >
        {this.state.fitted &&
          <Table
            ref="Table"
            headerHeight={headerHeight}
            height={totalTableHeight}
            overscanRowCount={overscanRowCount}
            rowClassName={this.rowClassName}
            rowHeight={rowHeight}
            rowGetter={rowGetter}
            rowCount={sortedAndFilteredList.size}
            sort={this.sort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            width={this.totalTableWidth}
          >
            {orderedColumnKeys.map(columnKey => (
              <Column
                cellRenderer={({ cellData }) => this.renderTableCell({ cellData, columnKey })}
                dataKey={columnKey}
                disableSort={false}
                headerRenderer={this.renderTableHeader}
                width={this.widthsForColumnsByKey[columnKey]}
                label={columnKey}
                key={columnKey}
              />
            ))}
          </Table>
        }
      </div>
    );
  }

  render() {
    if (this.props.orderedColumnKeys.length > MAX_COLUMNS_FOR_TABLE) {
      return this.renderGrid();
    }
    return this.renderTable();
  }
}

FilterableTable.propTypes = propTypes;
FilterableTable.defaultProps = defaultProps;
