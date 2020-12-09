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
import React, {
  FunctionComponent,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import rison from 'rison';
import { Alert, FormControl, FormControlProps } from 'react-bootstrap';
import { makeApi, SupersetClient, t } from '@superset-ui/core';
import TableView from 'src/components/TableView';
import Modal from 'src/common/components/Modal';
import getClientErrorObject from '../utils/getClientErrorObject';
import Loading from '../components/Loading';
import withToasts from '../messageToasts/enhancers/withToasts';

interface ChangeDatasourceModalProps {
  addDangerToast: (msg: string) => void;
  onChange: (uid: string) => void;
  onDatasourceSave: (datasource: object, errors?: Array<any>) => {};
  onHide: () => void;
  show: boolean;
}

const TABLE_COLUMNS = [
  'name',
  'type',
  'schema',
  'connection',
  'creator',
].map(col => ({ accessor: col, Header: col }));

const TABLE_FILTERABLE = ['rawName', 'type', 'schema', 'connection', 'creator'];
const CHANGE_WARNING_MSG = t(
  'Changing the dataset may break the chart if the chart relies ' +
    'on columns or metadata that does not exist in the target dataset',
);

const ChangeDatasourceModal: FunctionComponent<ChangeDatasourceModalProps> = ({
  addDangerToast,
  onChange,
  onDatasourceSave,
  onHide,
  show,
}) => {
  const [datasources, setDatasources] = useState<any>(null);
  const [filter, setFilter] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  let searchRef = useRef<HTMLInputElement>(null);

  const selectDatasource = useCallback(
    (datasource: { type: string; id: number; uid: string }) => {
      SupersetClient.get({
        endpoint: `/datasource/get/${datasource.type}/${datasource.id}`,
      })
        .then(({ json }) => {
          onDatasourceSave(json);
          onChange(`${datasource.id}__table`);
        })
        .catch(response => {
          getClientErrorObject(response).then(
            ({ error, message }: { error: any; message: string }) => {
              const errorMessage = error
                ? error.error || error.statusText || error
                : message;
              addDangerToast(errorMessage);
            },
          );
        });
      onHide();
    },
    [addDangerToast, onChange, onDatasourceSave, onHide],
  );

  useEffect(() => {
    const onEnterModal = () => {
      if (searchRef && searchRef.current) {
        searchRef.current.focus();
      }
      if (!datasources) {
        SupersetClient.get({
          endpoint: `/api/v1/dataset`,
        })
          .then(({ json }) => {
            const data = json.result.map((ds: any) => ({
              rawName: ds.table_name,
              connection: ds.database.database_name,
              schema: ds.schema,
              name: (
                <a
                  href="#"
                  onClick={() => selectDatasource({ type: 'table', ...ds })}
                  className="datasource-link"
                >
                  {ds.table_name}
                </a>
              ),
              type: ds.kind,
            }));
            setLoading(false);
            setDatasources(data);
          })
          .catch(response => {
            setLoading(false);
            getClientErrorObject(response).then(({ error }: any) => {
              addDangerToast(error.error || error.statusText || error);
            });
          });
      }
    };

    if (show) {
      onEnterModal();
    }
  }, [
    addDangerToast,
    datasources,
    onChange,
    onDatasourceSave,
    onHide,
    selectDatasource,
    show,
  ]);

  const setSearchRef = (ref: any) => {
    searchRef = ref;
  };

  const changeSearch = (
    event: React.FormEvent<FormControl & FormControlProps>,
  ) => {
    const searchValue = (event.currentTarget?.value as string) ?? '';
    const queryParams = rison.encode({
      filters: [
        {
          col: 'table_name',
          opr: 'ct',
          value: searchValue,
        },
      ],
      page_size: 0,
      page: 0,
    });

    SupersetClient.get({
      endpoint: `/api/v1/dataset?q=${queryParams}`,
    })
      .then(({ json }) => {
        const data = json.result.map((ds: any) => ({
          rawName: ds.table_name,
          connection: ds.database.database_name,
          schema: ds.schema,
          name: (
            <a
              href="#"
              onClick={() => selectDatasource({ type: 'table', ...ds })}
              className="datasource-link"
            >
              {ds.table_name}
            </a>
          ),
          type: ds.kind,
        }));
        setLoading(false);
        setDatasources(data);
      })
      .catch(response => {
        setLoading(false);
        getClientErrorObject(response).then(({ error }: any) => {
          addDangerToast(error.error || error.statusText || error);
        });
      });
  };

  const data = useMemo(
    () =>
      filter && datasources
        ? datasources.filter((datasource: any) =>
            TABLE_FILTERABLE.some(field => datasource[field]?.includes(filter)),
          )
        : datasources,
    [datasources, filter],
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      responsive
      title={t('Select a dataset')}
      hideFooter
    >
      <>
        <Alert bsStyle="warning">
          <strong>{t('Warning!')}</strong> {CHANGE_WARNING_MSG}
        </Alert>
        <div>
          <FormControl
            inputRef={ref => {
              setSearchRef(ref);
            }}
            type="text"
            bsSize="sm"
            value={filter}
            placeholder={t('Search / Filter')}
            onChange={changeSearch}
          />
        </div>
        {loading && <Loading />}
        {datasources && (
          <TableView
            columns={TABLE_COLUMNS}
            data={data}
            pageSize={20}
            className="table-condensed"
          />
        )}
      </>
    </Modal>
  );
};

export default withToasts(ChangeDatasourceModal);
