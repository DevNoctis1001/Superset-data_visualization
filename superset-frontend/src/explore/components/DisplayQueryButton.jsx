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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import htmlSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/htmlbars';
import markdownSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/markdown';
import sqlSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/sql';
import jsonSyntax from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';
import { DropdownButton, Row, Col, FormControl } from 'react-bootstrap';
import { Table } from 'reactable-arc';
import { t } from '@superset-ui/core';

import { Menu } from 'src/common/components';
import Button from 'src/components/Button';
import getClientErrorObject from '../../utils/getClientErrorObject';
import CopyToClipboard from '../../components/CopyToClipboard';
import { getChartDataRequest } from '../../chart/chartAction';
import downloadAsImage from '../../utils/downloadAsImage';
import Loading from '../../components/Loading';
import ModalTrigger from '../../components/ModalTrigger';
import RowCountLabel from './RowCountLabel';
import {
  applyFormattingToTabularData,
  prepareCopyToClipboardTabularData,
} from '../../utils/common';
import PropertiesModal from './PropertiesModal';
import { sliceUpdated } from '../actions/exploreActions';

SyntaxHighlighter.registerLanguage('markdown', markdownSyntax);
SyntaxHighlighter.registerLanguage('html', htmlSyntax);
SyntaxHighlighter.registerLanguage('sql', sqlSyntax);
SyntaxHighlighter.registerLanguage('json', jsonSyntax);

const propTypes = {
  onOpenInEditor: PropTypes.func,
  queryResponse: PropTypes.object,
  chartStatus: PropTypes.string,
  chartHeight: PropTypes.string.isRequired,
  latestQueryFormData: PropTypes.object.isRequired,
  slice: PropTypes.object,
};

const MENU_KEYS = {
  EDIT_PROPERTIES: 'edit_properties',
  RUN_IN_SQL_LAB: 'run_in_sql_lab',
  DOWNLOAD_AS_IMAGE: 'download_as_image',
};

export class DisplayQueryButton extends React.PureComponent {
  constructor(props) {
    super(props);
    const { datasource } = props.latestQueryFormData;
    this.state = {
      language: null,
      query: null,
      data: null,
      isLoading: false,
      error: null,
      filterText: '',
      sqlSupported: datasource && datasource.split('__')[1] === 'table',
      isPropertiesModalOpen: false,
    };
    this.beforeOpen = this.beforeOpen.bind(this);
    this.changeFilterText = this.changeFilterText.bind(this);
    this.closePropertiesModal = this.closePropertiesModal.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  beforeOpen(resultType) {
    this.setState({ isLoading: true });

    getChartDataRequest({
      formData: this.props.latestQueryFormData,
      resultFormat: 'json',
      resultType,
    })
      .then(response => {
        // Currently displaying of only first query is supported
        const result = response.result[0];
        this.setState({
          language: result.language,
          query: result.query,
          data: result.data,
          isLoading: false,
          error: null,
        });
      })
      .catch(response => {
        getClientErrorObject(response).then(({ error, statusText }) => {
          this.setState({
            error: error || statusText || t('Sorry, An error occurred'),
            isLoading: false,
          });
        });
      });
  }

  changeFilterText(event) {
    this.setState({ filterText: event.target.value });
  }

  openPropertiesModal() {
    this.setState({ isPropertiesModalOpen: true });
  }

  closePropertiesModal() {
    this.setState({ isPropertiesModalOpen: false });
  }

  handleMenuClick({ key, domEvent }) {
    const {
      chartHeight,
      slice,
      onOpenInEditor,
      latestQueryFormData,
    } = this.props;
    switch (key) {
      case MENU_KEYS.EDIT_PROPERTIES:
        this.openPropertiesModal();
        break;
      case MENU_KEYS.RUN_IN_SQL_LAB:
        onOpenInEditor(latestQueryFormData);
        break;
      case MENU_KEYS.DOWNLOAD_AS_IMAGE:
        downloadAsImage(
          '.chart-container',
          // eslint-disable-next-line camelcase
          slice?.slice_name ?? t('New chart'),
          {
            height: parseInt(chartHeight, 10),
          },
        )(domEvent);
        break;
      default:
        break;
    }
  }

  renderQueryModalBody() {
    if (this.state.isLoading) {
      return <Loading />;
    }
    if (this.state.error) {
      return <pre>{this.state.error}</pre>;
    }
    if (this.state.query) {
      return (
        <div>
          <CopyToClipboard
            text={this.state.query}
            shouldShowText={false}
            copyNode={
              <Button style={{ position: 'absolute', right: 20 }}>
                <i className="fa fa-clipboard" />
              </Button>
            }
          />
          <SyntaxHighlighter language={this.state.language} style={github}>
            {this.state.query}
          </SyntaxHighlighter>
        </div>
      );
    }
    return null;
  }

  renderResultsModalBody() {
    if (this.state.isLoading) {
      return <Loading />;
    }
    if (this.state.error) {
      return <pre>{this.state.error}</pre>;
    }
    if (this.state.data) {
      if (this.state.data.length === 0) {
        return 'No data';
      }
      return this.renderDataTable(this.state.data);
    }
    return null;
  }

  renderDataTable(data) {
    return (
      <div style={{ overflow: 'auto' }}>
        <Row>
          <Col md={9}>
            <RowCountLabel
              rowcount={data.length}
              suffix={t('rows retrieved')}
            />
            <CopyToClipboard
              text={prepareCopyToClipboardTabularData(data)}
              wrapped={false}
              copyNode={
                <Button style={{ padding: '2px 10px', fontSize: '11px' }}>
                  <i className="fa fa-clipboard" />
                </Button>
              }
            />
          </Col>
          <Col md={3}>
            <FormControl
              placeholder={t('Search')}
              bsSize="sm"
              value={this.state.filterText}
              onChange={this.changeFilterText}
              style={{ paddingBottom: '5px' }}
            />
          </Col>
        </Row>
        <Table
          className="table table-condensed"
          sortable
          data={applyFormattingToTabularData(data)}
          hideFilterInput
          filterBy={this.state.filterText}
          filterable={data.length ? Object.keys(data[0]) : null}
          noDataText={t('No data')}
        />
      </div>
    );
  }

  renderSamplesModalBody() {
    if (this.state.isLoading) {
      return <Loading />;
    }
    if (this.state.error) {
      return <pre>{this.state.error}</pre>;
    }
    if (this.state.data) {
      return this.renderDataTable(this.state.data);
    }
    return null;
  }

  render() {
    const { slice } = this.props;
    return (
      <DropdownButton
        noCaret
        data-test="query-dropdown"
        title={
          <span>
            <i className="fa fa-bars" />
            &nbsp;
          </span>
        }
        bsSize="sm"
        pullRight
        id="query"
      >
        <Menu onClick={this.handleMenuClick} selectable={false}>
          {slice && [
            <Menu.Item key={MENU_KEYS.EDIT_PROPERTIES}>
              {t('Edit properties')}
            </Menu.Item>,
            <PropertiesModal
              slice={slice}
              show={this.state.isPropertiesModalOpen}
              onHide={this.closePropertiesModal}
              onSave={this.props.sliceUpdated}
            />,
          ]}
          <Menu.Item>
            <ModalTrigger
              triggerNode={
                <span data-test="view-query-menu-item">{t('View query')}</span>
              }
              modalTitle={t('View query')}
              beforeOpen={() => this.beforeOpen('query')}
              modalBody={this.renderQueryModalBody()}
              responsive
            />
          </Menu.Item>
          <Menu.Item>
            <ModalTrigger
              triggerNode={<span>{t('View results')}</span>}
              modalTitle={t('View results')}
              beforeOpen={() => this.beforeOpen('results')}
              modalBody={this.renderResultsModalBody()}
              responsive
            />
          </Menu.Item>
          <Menu.Item>
            <ModalTrigger
              triggerNode={<span>{t('View samples')}</span>}
              modalTitle={t('View samples')}
              beforeOpen={() => this.beforeOpen('samples')}
              modalBody={this.renderSamplesModalBody()}
              responsive
            />
          </Menu.Item>
          {this.state.sqlSupported && (
            <Menu.Item key={MENU_KEYS.RUN_IN_SQL_LAB}>
              {t('Run in SQL Lab')}
            </Menu.Item>
          )}
          <Menu.Item key={MENU_KEYS.DOWNLOAD_AS_IMAGE}>
            {t('Download as image')}
          </Menu.Item>
        </Menu>
      </DropdownButton>
    );
  }
}

DisplayQueryButton.propTypes = propTypes;

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sliceUpdated }, dispatch);
}

export default connect(null, mapDispatchToProps)(DisplayQueryButton);
