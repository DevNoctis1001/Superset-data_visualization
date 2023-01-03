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
import { styled, t, logging } from '@superset-ui/core';
import React, { useEffect, useState } from 'react';
import { UseGetDatasetRelatedObjects } from 'src/views/CRUD/data/hooks';
import Badge from 'src/components/Badge';
import Tabs from 'src/components/Tabs';

const StyledTabs = styled(Tabs)`
  ${({ theme }) => `
  margin-top: ${theme.gridUnit * 8.5}px;
  padding-left: ${theme.gridUnit * 4}px;

  .ant-tabs-top > .ant-tabs-nav::before {
    width: ${theme.gridUnit * 50}px;
  }
  `}
`;

const TabStyles = styled.div`
  ${({ theme }) => `
  .ant-badge {
    width: ${theme.gridUnit * 8}px;
    margin-left: ${theme.gridUnit * 2.5}px;
  }
  `}
`;

interface EditPageProps {
  id: string;
}

const TRANSLATIONS = {
  USAGE_TEXT: t('Usage'),
  COLUMNS_TEXT: t('Columns'),
  METRICS_TEXT: t('Metrics'),
};

const EditPage = ({ id }: EditPageProps) => {
  const [usageCount, setUsageCount] = useState(0);
  useEffect(() => {
    // Todo: this useEffect should be used to call all count methods conncurently
    // when we populate data for the new tabs. For right separating out this
    // api call for building the usage page.
    if (id)
      UseGetDatasetRelatedObjects(id)
        .then(json => {
          setUsageCount(json?.charts.count);
        })
        .catch(err => logging.log(err));
  }, [id]);

  const UsageTab = (
    <TabStyles>
      <span>{TRANSLATIONS.USAGE_TEXT}</span>
      {usageCount > 0 && <Badge count={usageCount} />}
    </TabStyles>
  );

  return (
    <StyledTabs moreIcon={null} fullWidth={false}>
      <Tabs.TabPane tab={TRANSLATIONS.COLUMNS_TEXT} key="1" />
      <Tabs.TabPane tab={TRANSLATIONS.METRICS_TEXT} key="2" />
      <Tabs.TabPane tab={UsageTab} key="3" />
    </StyledTabs>
  );
};

export default EditPage;
