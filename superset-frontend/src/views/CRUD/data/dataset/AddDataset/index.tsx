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
import React, { useReducer, Reducer, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetDatasetsList } from 'src/views/CRUD/data/hooks';
import Header from './Header';
import EditPage from './EditDataset';
import DatasetPanel from './DatasetPanel';
import LeftPanel from './LeftPanel';
import Footer from './Footer';
import { DatasetActionType, DatasetObject, DSReducerActionType } from './types';
import DatasetLayout from '../DatasetLayout';

type Schema = {
  schema: string;
};

export function datasetReducer(
  state: DatasetObject | null,
  action: DSReducerActionType,
): Partial<DatasetObject> | Schema | null {
  const trimmedState = {
    ...(state || {}),
  };

  switch (action.type) {
    case DatasetActionType.selectDatabase:
      return {
        ...trimmedState,
        ...action.payload,
        schema: null,
        table_name: null,
      };
    case DatasetActionType.selectSchema:
      return {
        ...trimmedState,
        [action.payload.name]: action.payload.value,
        table_name: null,
      };
    case DatasetActionType.selectTable:
      return {
        ...trimmedState,
        [action.payload.name]: action.payload.value,
      };
    case DatasetActionType.changeDataset:
      return {
        ...trimmedState,
        [action.payload.name]: action.payload.value,
      };
    default:
      return null;
  }
}

const prevUrl =
  '/tablemodelview/list/?pageIndex=0&sortColumn=changed_on_delta_humanized&sortOrder=desc';

export default function AddDataset() {
  const [dataset, setDataset] = useReducer<
    Reducer<Partial<DatasetObject> | null, DSReducerActionType>
  >(datasetReducer, null);
  const [hasColumns, setHasColumns] = useState(false);
  const [editPageIsVisible, setEditPageIsVisible] = useState(false);
  const encodedSchema = dataset?.schema
    ? encodeURIComponent(dataset?.schema)
    : undefined;

  const { getDatasetsList, datasets, datasetNames } = useGetDatasetsList();

  useEffect(() => {
    const filters = [
      { col: 'database', opr: 'rel_o_m', value: dataset?.db?.id },
      { col: 'schema', opr: 'eq', value: encodedSchema },
      { col: 'sql', opr: 'dataset_is_null_or_empty', value: true },
    ];

    if (dataset?.schema) {
      getDatasetsList(filters);
    }
  }, [dataset?.db?.id, dataset?.schema, encodedSchema, getDatasetsList]);

  const { datasetId: id } = useParams<{ datasetId: string }>();
  useEffect(() => {
    if (!Number.isNaN(parseInt(id, 10))) {
      setEditPageIsVisible(true);
    }
  }, [id]);

  const HeaderComponent = () => (
    <Header setDataset={setDataset} title={dataset?.table_name} />
  );

  const LeftPanelComponent = () => (
    <LeftPanel
      setDataset={setDataset}
      dataset={dataset}
      datasetNames={datasetNames}
    />
  );

  const EditPageComponent = () => <EditPage id={id} />;

  const DatasetPanelComponent = () => (
    <DatasetPanel
      tableName={dataset?.table_name}
      dbId={dataset?.db?.id}
      schema={dataset?.schema}
      setHasColumns={setHasColumns}
      datasets={datasets}
    />
  );

  const FooterComponent = () => (
    <Footer
      url={prevUrl}
      datasetObject={dataset}
      hasColumns={hasColumns}
      datasets={datasetNames}
    />
  );

  return (
    <DatasetLayout
      header={HeaderComponent()}
      leftPanel={editPageIsVisible ? null : LeftPanelComponent()}
      datasetPanel={
        editPageIsVisible ? EditPageComponent() : DatasetPanelComponent()
      }
      footer={FooterComponent()}
      editPageIsVisible={editPageIsVisible}
    />
  );
}
