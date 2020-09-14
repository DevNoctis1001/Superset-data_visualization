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
import { Modal, MenuItem } from 'react-bootstrap';

import Button from 'src/components/Button';

const propTypes = {
  dialogClassName: PropTypes.string,
  animation: PropTypes.bool,
  triggerNode: PropTypes.node.isRequired,
  modalTitle: PropTypes.node,
  modalBody: PropTypes.node, // not required because it can be generated by beforeOpen
  modalFooter: PropTypes.node,
  beforeOpen: PropTypes.func,
  onExit: PropTypes.func,
  isButton: PropTypes.bool,
  isMenuItem: PropTypes.bool,
  bsSize: PropTypes.oneOf(['large', 'small']), // react-bootstrap also supports 'sm', 'lg' but we're keeping it simple.
  className: PropTypes.string,
  tooltip: PropTypes.string,
  backdrop: PropTypes.oneOf(['static', true, false]),
};

const defaultProps = {
  animation: true,
  beforeOpen: () => {},
  onExit: () => {},
  isButton: false,
  isMenuItem: false,
  bsSize: null,
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
        dialogClassName={this.props.dialogClassName}
        animation={this.props.animation}
        show={this.state.showModal}
        onHide={this.close}
        onExit={this.props.onExit}
        bsSize={this.props.bsSize}
        className={this.props.className}
        backdrop={this.props.backdrop}
      >
        {this.props.modalTitle && (
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modalTitle}</Modal.Title>
          </Modal.Header>
        )}
        <Modal.Body>{this.props.modalBody}</Modal.Body>
        {this.props.modalFooter && (
          <Modal.Footer>{this.props.modalFooter}</Modal.Footer>
        )}
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
