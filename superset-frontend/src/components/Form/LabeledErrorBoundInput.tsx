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
import { Input } from 'antd';
import { styled, css, SupersetTheme } from '@superset-ui/core';
import InfoTooltip from 'src/components/InfoTooltip';
import FormItem from './FormItem';
import FormLabel from './FormLabel';

export interface LabeledErrorBoundInputProps {
  label?: string;
  validationMethods:
    | { onBlur: (value: any) => void }
    | { onChange: (value: any) => void };
  errorMessage: string | null;
  helpText?: string;
  required?: boolean;
  hasTooltip?: boolean;
  tooltipText?: string | null;
  id?: string;
  classname?: string;
  [x: string]: any;
}

const StyledInput = styled(Input)`
  margin: ${({ theme }) => `${theme.gridUnit}px 0 ${theme.gridUnit * 2}px`};
`;

const alertIconStyles = (theme: SupersetTheme, hasError: boolean) => css`
  .ant-form-item-children-icon {
    display: none;
  }
  ${hasError &&
  `.ant-form-item-control-input-content {
      position: relative;

      &:after {
        content: ' ';
        display: inline-block;
        background: ${theme.colors.error.base};
        mask: url('/images/icons/error.svg');
        mask-size: cover;
        width: ${theme.gridUnit * 4}px;
        height: ${theme.gridUnit * 4}px;
        position: absolute;
        right: 7px;
        top: 15px;
      }
    }`}
`;

const StyledFormGroup = styled('div')`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  margin-bottom: ${({ theme }) => theme.gridUnit * 5}px;
  .ant-form-item {
    margin-bottom: 0;
  }
`;

const infoTooltip = (theme: SupersetTheme) => css`
  svg {
    vertical-align: bottom;
    margin-bottom: ${theme.gridUnit * 0.25}px;
  }
`;

const LabeledErrorBoundInput = ({
  label,
  validationMethods,
  errorMessage,
  helpText,
  required = false,
  hasTooltip = false,
  tooltipText,
  id,
  className,
  ...props
}: LabeledErrorBoundInputProps) => (
  <StyledFormGroup className={className}>
    <FormLabel
      htmlFor={id}
      required={required}
      css={(theme: SupersetTheme) => infoTooltip(theme)}
    >
      {label}
    </FormLabel>
    {hasTooltip && (
      <InfoTooltip tooltip={`${tooltipText}`} viewBox="0 -6 24 24" />
    )}
    <FormItem
      css={(theme: SupersetTheme) => alertIconStyles(theme, !!errorMessage)}
      validateTrigger={Object.keys(validationMethods)}
      validateStatus={errorMessage ? 'error' : 'success'}
      help={errorMessage || helpText}
      hasFeedback={!!errorMessage}
    >
      <StyledInput {...props} {...validationMethods} />
    </FormItem>
  </StyledFormGroup>
);

export default LabeledErrorBoundInput;
