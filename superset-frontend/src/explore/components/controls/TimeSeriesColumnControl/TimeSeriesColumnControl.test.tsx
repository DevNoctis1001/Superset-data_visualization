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
import { render, screen } from 'spec/helpers/testing-library';
import userEvent from '@testing-library/user-event';
import TimeSeriesColumnControl from '.';

test('renders with default props', () => {
  render(<TimeSeriesColumnControl />);
  expect(screen.getByText('Time series columns')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('renders popover on edit', () => {
  render(<TimeSeriesColumnControl />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  expect(screen.getByText('Label')).toBeInTheDocument();
  expect(screen.getByText('Tooltip')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
});

test('triggers onChange when type changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  userEvent.click(screen.getByText('Select...'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.click(screen.getByText('Time comparison'));
  expect(onChange).toHaveBeenCalled();
});

test('renders time comparison', () => {
  render(<TimeSeriesColumnControl colType="time" />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Time lag')).toBeInTheDocument();
  expect(screen.getAllByText('Type')[1]).toBeInTheDocument();
  expect(screen.getByText('Color bounds')).toBeInTheDocument();
  expect(screen.getByText('Number format')).toBeInTheDocument();
});

test('renders contribution', () => {
  render(<TimeSeriesColumnControl colType="contrib" />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Color bounds')).toBeInTheDocument();
  expect(screen.getByText('Number format')).toBeInTheDocument();
});

test('renders sparkline', () => {
  render(<TimeSeriesColumnControl colType="spark" />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Width')).toBeInTheDocument();
  expect(screen.getByText('Height')).toBeInTheDocument();
  expect(screen.getByText('Time ratio')).toBeInTheDocument();
  expect(screen.getByText('Show Y-axis')).toBeInTheDocument();
  expect(screen.getByText('Y-axis bounds')).toBeInTheDocument();
  expect(screen.getByText('Number format')).toBeInTheDocument();
  expect(screen.getByText('Date format')).toBeInTheDocument();
});

test('renders period average', () => {
  render(<TimeSeriesColumnControl colType="avg" />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Time lag')).toBeInTheDocument();
  expect(screen.getByText('Color bounds')).toBeInTheDocument();
  expect(screen.getByText('Number format')).toBeInTheDocument();
});

test('triggers onChange when time lag changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="time" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Time Lag'), '1');
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when color bounds changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="time" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Min'), '1');
  userEvent.type(screen.getByPlaceholderText('Max'), '10');
  expect(onChange).toHaveBeenCalledTimes(3);
});

test('triggers onChange when time type changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="time" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  userEvent.click(screen.getByText('Select...'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.click(screen.getByText('Difference'));
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when number format changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="time" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Number format string'), 'format');
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when width changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Width'), '10');
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when height changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Height'), '10');
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when time ratio changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Time Ratio'), '10');
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when show Y-axis changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.click(screen.getByRole('checkbox'));
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when Y-axis bounds changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Min'), '1');
  userEvent.type(screen.getByPlaceholderText('Max'), '10');
  expect(onChange).toHaveBeenCalledTimes(3);
});

test('triggers onChange when date format changes', () => {
  const onChange = jest.fn();
  render(<TimeSeriesColumnControl colType="spark" onChange={onChange} />);
  userEvent.click(screen.getByRole('button'));
  expect(onChange).not.toHaveBeenCalled();
  userEvent.type(screen.getByPlaceholderText('Date format string'), 'yy/MM/dd');
  expect(onChange).toHaveBeenCalled();
});
