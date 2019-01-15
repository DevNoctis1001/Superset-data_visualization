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
import PropTypes from 'prop-types';
import { Label, Popover, OverlayTrigger } from 'react-bootstrap';

import TextControl from './TextControl';
import MetricsControl from './MetricsControl';
import ControlHeader from '../ControlHeader';
import PopoverSection from '../../../components/PopoverSection';

const controlTypes = {
  fixed: 'fix',
  metric: 'metric',
};

const propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
  isFloat: PropTypes.bool,
  datasource: PropTypes.object.isRequired,
  default: PropTypes.shape({
    type: PropTypes.oneOf(['fix', 'metric']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

const defaultProps = {
  onChange: () => {},
  default: { type: controlTypes.fixed, value: 5 },
};

export default class FixedOrMetricControl extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.setType = this.setType.bind(this);
    this.setFixedValue = this.setFixedValue.bind(this);
    this.setMetric = this.setMetric.bind(this);
    const type = (props.value ? props.value.type : props.default.type) || controlTypes.fixed;
    const value = (props.value ? props.value.value : props.default.value) || '100';
    this.state = {
      type,
      fixedValue: type === controlTypes.fixed ? value : '',
      metricValue: type === controlTypes.metric ? value : null,
    };
  }
  onChange() {
    this.props.onChange({
      type: this.state.type,
      value: this.state.type === controlTypes.fixed ?
        this.state.fixedValue : this.state.metricValue,
    });
  }
  setType(type) {
    this.setState({ type }, this.onChange);
  }
  setFixedValue(fixedValue) {
    this.setState({ fixedValue }, this.onChange);
  }
  setMetric(metricValue) {
    this.setState({ metricValue }, this.onChange);
  }
  renderPopover() {
    const value = this.props.value || this.props.default;
    const type = value.type || controlTypes.fixed;
    return (
      <Popover id="filter-popover">
        <div style={{ width: '240px' }}>
          <PopoverSection
            title="Fixed"
            isSelected={type === controlTypes.fixed}
            onSelect={() => { this.onChange(controlTypes.fixed); }}
          >
            <TextControl
              isFloat
              onChange={this.setFixedValue}
              onFocus={() => { this.setType(controlTypes.fixed); }}
              value={this.state.fixedValue}
            />
          </PopoverSection>
          <PopoverSection
            title="Based on a metric"
            isSelected={type === controlTypes.metric}
            onSelect={() => { this.onChange(controlTypes.metric); }}
          >
            <MetricsControl
              name="metric"
              datasource={this.state.datasource}
              multi={false}
              onFocus={() => { this.setType(controlTypes.metric); }}
              onChange={this.setMetric}
              value={this.state.metricValue}
            />
          </PopoverSection>
        </div>
      </Popover>
    );
  }
  render() {
    return (
      <div>
        <ControlHeader {...this.props} />
        <OverlayTrigger
          container={document.body}
          trigger="click"
          rootClose
          ref="trigger"
          placement="right"
          overlay={this.renderPopover()}
        >
          <Label style={{ cursor: 'pointer' }}>
            {this.state.type === controlTypes.fixed &&
              <span>{this.state.fixedValue}</span>
            }
            {this.state.type === controlTypes.metric &&
              <span>
                <span style={{ fontWeight: 'normal' }}>metric: </span>
                <strong>{this.state.metricValue}</strong>
              </span>
            }
          </Label>
        </OverlayTrigger>
      </div>
    );
  }
}

FixedOrMetricControl.propTypes = propTypes;
FixedOrMetricControl.defaultProps = defaultProps;
