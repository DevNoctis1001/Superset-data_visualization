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
import { t, supersetTheme } from '@superset-ui/core';
import Icon from 'src/components/Icon';
import TooltipWrapper from 'src/components/TooltipWrapper';

interface CertifiedIconWithTooltipProps {
  certifiedBy?: string;
  details?: string;
  size?: number;
}

function CertifiedIconWithTooltip({
  certifiedBy,
  details,
  size = 24,
}: CertifiedIconWithTooltipProps) {
  return (
    <TooltipWrapper
      label="certified-details"
      tooltip={
        <>
          {certifiedBy && <div>{t('Certified by %s', certifiedBy)}</div>}
          <div>{details}</div>
        </>
      }
    >
      <Icon
        color={supersetTheme.colors.primary.base}
        height={size}
        width={size}
        name="certified"
      />
    </TooltipWrapper>
  );
}

export default CertifiedIconWithTooltip;
