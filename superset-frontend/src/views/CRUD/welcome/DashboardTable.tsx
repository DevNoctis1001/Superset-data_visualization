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
import React, { useEffect, useState } from 'react';
import { SupersetClient, t } from '@superset-ui/core';
import { useListViewResource } from 'src/views/CRUD/hooks';
import { Dashboard, DashboardTableProps } from 'src/views/CRUD/types';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import PropertiesModal from 'src/dashboard/components/PropertiesModal';
import DashboardCard from 'src/views/CRUD/dashboard/DashboardCard';
import SubMenu from 'src/components/Menu/SubMenu';
import Icon from 'src/components/Icon';
import EmptyState from './EmptyState';
import { createErrorHandler, CardContainer, IconContainer } from '../utils';

const PAGE_SIZE = 3;

export interface FilterValue {
  col: string;
  operator: string;
  value: string | boolean | number | null | undefined;
}

function DashboardTable({
  user,
  addDangerToast,
  addSuccessToast,
}: DashboardTableProps) {
  const {
    state: { loading, resourceCollection: dashboards, bulkSelectEnabled },
    setResourceCollection: setDashboards,
    hasPerm,
    refreshData,
    fetchData,
  } = useListViewResource<Dashboard>(
    'dashboard',
    t('dashboard'),
    addDangerToast,
  );

  const [editModal, setEditModal] = useState<Dashboard>();
  const [dashboardFilter, setDashboardFilter] = useState('Mine');

  const handleDashboardEdit = (edits: Dashboard) => {
    return SupersetClient.get({
      endpoint: `/api/v1/dashboard/${edits.id}`,
    }).then(
      ({ json = {} }) => {
        setDashboards(
          dashboards.map(dashboard => {
            if (dashboard.id === json.id) {
              return json.result;
            }
            return dashboard;
          }),
        );
      },
      createErrorHandler(errMsg =>
        addDangerToast(
          t('An error occurred while fetching dashboards: %s', errMsg),
        ),
      ),
    );
  };

  const getFilters = () => {
    const filters = [];

    if (dashboardFilter === 'Mine') {
      filters.push({
        id: 'owners',
        operator: 'rel_m_m',
        value: `${user?.userId}`,
      });
    } else {
      filters.push({
        id: 'id',
        operator: 'dashboard_is_fav',
        value: true,
      });
    }
    return filters;
  };
  const subMenus = [];
  if (dashboards.length > 0 && dashboardFilter === 'favorite') {
    subMenus.push({
      name: 'Favorite',
      label: t('Favorite'),
      onClick: () => setDashboardFilter('Favorite'),
    });
  }

  useEffect(() => {
    fetchData({
      pageIndex: 0,
      pageSize: PAGE_SIZE,
      sortBy: [
        {
          id: 'changed_on_delta_humanized',
          desc: true,
        },
      ],
      filters: getFilters(),
    });
  }, [dashboardFilter]);

  return (
    <>
      <SubMenu
        activeChild={dashboardFilter}
        tabs={[
          {
            name: 'Favorite',
            label: t('Favorite'),
            onClick: () => setDashboardFilter('Favorite'),
          },
          {
            name: 'Mine',
            label: t('Mine'),
            onClick: () => setDashboardFilter('Mine'),
          },
        ]}
        buttons={[
          {
            name: (
              <IconContainer>
                <Icon name="plus-small" /> Dashboard{' '}
              </IconContainer>
            ),
            buttonStyle: 'tertiary',
            onClick: () => {
              window.location.href = '/dashboard/new';
            },
          },
          {
            name: 'View All »',
            buttonStyle: 'link',
            onClick: () => {
              window.location.href = '/dashboard/list/';
            },
          },
        ]}
      />
      {editModal && (
        <PropertiesModal
          dashboardId={editModal?.id}
          show
          onHide={() => setEditModal(undefined)}
          onSubmit={handleDashboardEdit}
        />
      )}
      {dashboards.length > 0 ? (
        <CardContainer>
          {dashboards.map(e => (
            <DashboardCard
              {...{
                dashboard: e,
                hasPerm,
                bulkSelectEnabled,
                refreshData,
                addDangerToast,
                addSuccessToast,
                loading,
                openDashboardEditModal: dashboard => setEditModal(dashboard),
              }}
            />
          ))}
        </CardContainer>
      ) : (
        <EmptyState tableName="DASHBOARDS" tab={dashboardFilter} />
      )}
    </>
  );
}

export default withToasts(DashboardTable);
