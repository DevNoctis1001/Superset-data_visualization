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
import { MenuItem } from 'react-bootstrap';
import Modal from 'src/common/components/Modal';
import Button from 'src/components/Button';

const propTypes = {
  dialogClassName: PropTypes.string,
  triggerNode: PropTypes.node.isRequired,
  modalTitle: PropTypes.node,
  modalBody: PropTypes.node, // not required because it can be generated by beforeOpen
  modalFooter: PropTypes.node,
  beforeOpen: PropTypes.func,
  onExit: PropTypes.func,
  isButton: PropTypes.bool,
  isMenuItem: PropTypes.bool,
  className: PropTypes.string,
  tooltip: PropTypes.string,
  width: PropTypes.string,
  maxWidth: PropTypes.string,
  responsive: PropTypes.bool,
};

const defaultProps = {
  beforeOpen: () => {},
  onExit: () => {},
  isButton: false,
  isMenuItem: false,
  className: '',
  modalTitle: '',
};

export default class ModalTrigger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    this.setState(() => ({ showModal: false }));
  }

  open(e) {
    e.preventDefault();
    this.props.beforeOpen();
    this.setState(() => ({ showModal: true }));
  }

  renderModal() {
    return (
      <Modal
        wrapClassName={this.props.dialogClassName}
        className={this.props.className}
        show={this.state.showModal}
        onHide={this.close}
        afterClose={this.props.onExit}
        title={this.props.modalTitle}
        footer={this.props.modalFooter}
        hideFooter={!this.props.modalFooter}
        maxWidth={this.props.maxWidth}
        responsive={this.props.responsive}
      >
        {this.props.modalBody}
      </Modal>
    );
  }

  render() {
    if (this.props.isButton) {
      return (
        <>
          <Button
            className="modal-trigger"
            tooltip={this.props.tooltip}
            onClick={this.open}
          >
            {this.props.triggerNode}
          </Button>
          {this.renderModal()}
        </>
      );
    }
    if (this.props.isMenuItem) {
      return (
        <>
          <MenuItem onClick={this.open}>{this.props.triggerNode}</MenuItem>
          {this.renderModal()}
        </>
      );
    }
    /* eslint-disable jsx-a11y/interactive-supports-focus */
    return (
      <>
        <span onClick={this.open} role="button">
          {this.props.triggerNode}
        </span>
        {this.renderModal()}
      </>
    );
  }
}

ModalTrigger.propTypes = propTypes;
ModalTrigger.defaultProps = defaultProps;
