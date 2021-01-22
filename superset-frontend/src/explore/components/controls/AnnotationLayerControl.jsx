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
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { t, withTheme } from '@superset-ui/core';
import { InfoTooltipWithTrigger } from '@superset-ui/chart-controls';
import Popover from 'src/common/components/Popover';
import AsyncEsmComponent from 'src/components/AsyncEsmComponent';
import { getChartKey } from 'src/explore/exploreUtils';
import { runAnnotationQuery } from 'src/chart/chartAction';

const AnnotationLayer = AsyncEsmComponent(
  () => import('./AnnotationLayer'),
  // size of overlay inner content
  () => <div style={{ width: 450, height: 368 }} />,
);

const propTypes = {
  colorScheme: PropTypes.string.isRequired,
  annotationError: PropTypes.object,
  annotationQuery: PropTypes.object,
  vizType: PropTypes.string,

  validationErrors: PropTypes.array,
  name: PropTypes.string.isRequired,
  actions: PropTypes.object,
  value: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  refreshAnnotationData: PropTypes.func,
};

const defaultProps = {
  vizType: '',
  value: [],
  annotationError: {},
  annotationQuery: {},
  onChange: () => {},
};

class AnnotationLayerControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { popoverVisible: {}, addedAnnotationIndex: null };
    this.addAnnotationLayer = this.addAnnotationLayer.bind(this);
    this.removeAnnotationLayer = this.removeAnnotationLayer.bind(this);
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
  }

  componentDidMount() {
    // preload the AnotationLayer component and dependent libraries i.e. mathjs
    AnnotationLayer.preload();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { name, annotationError, validationErrors, value } = nextProps;
    if (Object.keys(annotationError).length && !validationErrors.length) {
      this.props.actions.setControlValue(
        name,
        value,
        Object.keys(annotationError),
      );
    }
    if (!Object.keys(annotationError).length && validationErrors.length) {
      this.props.actions.setControlValue(name, value, []);
    }
  }

  addAnnotationLayer(originalAnnotation, newAnnotation) {
    let annotations = this.props.value;
    if (annotations.includes(originalAnnotation)) {
      annotations = annotations.map(anno =>
        anno === originalAnnotation ? newAnnotation : anno,
      );
    } else {
      annotations = [...annotations, newAnnotation];
      this.setState({ addedAnnotationIndex: annotations.length - 1 });
    }

    this.props.refreshAnnotationData(newAnnotation);
    this.props.onChange(annotations);
  }

  handleVisibleChange(visible, popoverKey) {
    this.setState(prevState => ({
      popoverVisible: { ...prevState.popoverVisible, [popoverKey]: visible },
    }));
  }

  removeAnnotationLayer(annotation) {
    const annotations = this.props.value.filter(anno => anno !== annotation);
    this.props.onChange(annotations);
  }

  renderPopover(popoverKey, annotation, error) {
    const id = annotation?.name || '_new';

    return (
      <div id={`annotation-pop-${id}`} data-test="popover-content">
        <AnnotationLayer
          {...annotation}
          error={error}
          colorScheme={this.props.colorScheme}
          vizType={this.props.vizType}
          addAnnotationLayer={newAnnotation =>
            this.addAnnotationLayer(annotation, newAnnotation)
          }
          removeAnnotationLayer={() => this.removeAnnotationLayer(annotation)}
          close={() => {
            this.handleVisibleChange(false, popoverKey);
            this.setState({ addedAnnotationIndex: null });
          }}
        />
      </div>
    );
  }

  renderInfo(anno) {
    const { annotationError, annotationQuery } = this.props;
    if (annotationQuery[anno.name]) {
      return (
        <i className="fa fa-refresh" style={{ color: 'orange' }} aria-hidden />
      );
    }
    if (annotationError[anno.name]) {
      return (
        <InfoTooltipWithTrigger
          label="validation-errors"
          bsStyle="danger"
          tooltip={annotationError[anno.name]}
        />
      );
    }
    if (!anno.show) {
      return <span style={{ color: 'red' }}> Hidden </span>;
    }
    return '';
  }

  render() {
    const { addedAnnotationIndex } = this.state;
    const addedAnnotation = this.props.value[addedAnnotationIndex];

    const annotations = this.props.value.map((anno, i) => (
      <Popover
        key={i}
        trigger="click"
        placement="right"
        title={t('Edit Annotation Layer')}
        content={this.renderPopover(
          i,
          anno,
          this.props.annotationError[anno.name],
        )}
        visible={this.state.popoverVisible[i]}
        onVisibleChange={visible => this.handleVisibleChange(visible, i)}
      >
        <ListGroupItem>
          <span>{anno.name}</span>
          <span style={{ float: 'right' }}>{this.renderInfo(anno)}</span>
        </ListGroupItem>
      </Popover>
    ));

    const addLayerPopoverKey = 'add';
    return (
      <div>
        <ListGroup>
          {annotations}
          <Popover
            trigger="click"
            placement="right"
            content={this.renderPopover(addLayerPopoverKey, addedAnnotation)}
            title={t('Add annotation layer')}
            visible={this.state.popoverVisible[addLayerPopoverKey]}
            destroyTooltipOnHide
            onVisibleChange={visible =>
              this.handleVisibleChange(visible, addLayerPopoverKey)
            }
          >
            <ListGroupItem>
              <i
                data-test="add-annotation-layer-button"
                className="fa fa-plus"
              />{' '}
              &nbsp; {t('Add annotation layer')}
            </ListGroupItem>
          </Popover>
        </ListGroup>
      </div>
    );
  }
}

AnnotationLayerControl.propTypes = propTypes;
AnnotationLayerControl.defaultProps = defaultProps;

// Tried to hook this up through stores/control.jsx instead of using redux
// directly, could not figure out how to get access to the color_scheme
function mapStateToProps({ charts, explore }) {
  const chartKey = getChartKey(explore);
  const chart = charts[chartKey] || charts[0] || {};

  return {
    // eslint-disable-next-line camelcase
    colorScheme: explore.controls?.color_scheme?.value,
    annotationError: chart.annotationError,
    annotationQuery: chart.annotationQuery,
    vizType: explore.controls.viz_type.value,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    refreshAnnotationData: annotationLayer =>
      dispatch(runAnnotationQuery(annotationLayer)),
  };
}

const themedAnnotationLayerControl = withTheme(AnnotationLayerControl);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(themedAnnotationLayerControl);
