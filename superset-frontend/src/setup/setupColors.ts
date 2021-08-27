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
import airbnb from '@superset-ui/core/lib/color/colorSchemes/categorical/airbnb';
import categoricalD3 from '@superset-ui/core/lib/color/colorSchemes/categorical/d3';
import echarts from '@superset-ui/core/lib/color/colorSchemes/categorical/echarts';
import google from '@superset-ui/core/lib/color/colorSchemes/categorical/google';
import lyft from '@superset-ui/core/lib/color/colorSchemes/categorical/lyft';
import preset from '@superset-ui/core/lib/color/colorSchemes/categorical/preset';
import sequentialCommon from '@superset-ui/core/lib/color/colorSchemes/sequential/common';
import sequentialD3 from '@superset-ui/core/lib/color/colorSchemes/sequential/d3';
import {
  CategoricalScheme,
  getCategoricalSchemeRegistry,
  getSequentialSchemeRegistry,
  SequentialScheme,
} from '@superset-ui/core';
import superset from '@superset-ui/core/lib/color/colorSchemes/categorical/superset';

function findDefaultKey(
  colorSchemes: (CategoricalScheme | SequentialScheme)[],
  fallback: string,
) {
  return colorSchemes.reduce(
    (defaultKey, scheme) => (scheme.isDefault ? scheme.id : defaultKey),
    fallback,
  );
}

export default function setupColors(
  extraCategoricalColorSchemes: CategoricalScheme[] = [],
  extraSequentialColorSchemes: SequentialScheme[] = [],
) {
  // Register color schemes
  const categoricalSchemeRegistry = getCategoricalSchemeRegistry();

  if (extraCategoricalColorSchemes?.length > 0) {
    extraCategoricalColorSchemes.forEach(scheme => {
      categoricalSchemeRegistry.registerValue(scheme.id, scheme);
    });
  }

  [superset, airbnb, categoricalD3, echarts, google, lyft, preset].forEach(
    group => {
      group.forEach(scheme => {
        categoricalSchemeRegistry.registerValue(scheme.id, scheme);
      });
    },
  );

  categoricalSchemeRegistry.setDefaultKey(
    findDefaultKey(extraCategoricalColorSchemes, 'supersetColors'),
  );

  const sequentialSchemeRegistry = getSequentialSchemeRegistry();

  if (extraSequentialColorSchemes?.length > 0) {
    extraSequentialColorSchemes.forEach(scheme => {
      sequentialSchemeRegistry.registerValue(
        scheme.id,
        new SequentialScheme(scheme),
      );
    });
  }

  [sequentialCommon, sequentialD3].forEach(group => {
    group.forEach(scheme => {
      sequentialSchemeRegistry.registerValue(scheme.id, scheme);
    });
  });

  sequentialSchemeRegistry.setDefaultKey(
    findDefaultKey(extraSequentialColorSchemes, 'superset_seq_1'),
  );
}
