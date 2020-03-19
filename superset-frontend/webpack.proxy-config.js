/* eslint-disable no-console */
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
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const parsedArgs = require('yargs').argv;

const { supersetPort = 8088, superset: supersetUrl = null } = parsedArgs;
const backend = (supersetUrl || `http://localhost:${supersetPort}`).replace(
  '//+$/',
  '',
); // strip ending backslash
const MANIFEST_FILE = path.resolve(
  __dirname,
  '../superset/static/assets/manifest.json',
);

let manifestContent;
let manifest;
function loadManifest() {
  try {
    const newContent = fs.readFileSync(MANIFEST_FILE, { encoding: 'utf-8' });
    if (!newContent || newContent === manifestContent) return;
    manifestContent = newContent;
    manifest = JSON.parse(manifestContent);
    console.log(`${MANIFEST_FILE} loaded.`);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error('\n>> Error loading manifest file:');
      console.trace(e);
    }
  }
}

function isHTML(res) {
  const CONTENT_TYPE_HEADER = 'content-type';
  const contentType = res.getHeader
    ? res.getHeader(CONTENT_TYPE_HEADER)
    : res.headers[CONTENT_TYPE_HEADER];
  return contentType.includes('text/html');
}

function toDevHTML(originalHtml) {
  let html = originalHtml.replace(
    /(<head>\s*<title>)([\s\S]*)(<\/title>)/i,
    '$1[DEV] $2 $3',
  );
  // load manifest file only when needed
  if (!manifest) {
    loadManifest();
  }
  if (manifest) {
    const loaded = new Set();
    // replace bundled asset files, HTML comment tags generated by Jinja macros
    // in superset/templates/superset/partials/asset_bundle.html
    html = html.replace(
      /<!-- Bundle (css|js) (.*?) START -->[\s\S]*?<!-- Bundle \1 \2 END -->/gi,
      (match, assetType, bundleName) => {
        if (bundleName in manifest.entrypoints) {
          return `<!-- DEV bundle: ${bundleName} ${assetType} START -->\n  ${(
            manifest.entrypoints[bundleName][assetType] || []
          )
            .filter(chunkFilePath => {
              if (loaded.has(chunkFilePath)) {
                return false;
              }
              loaded.add(chunkFilePath);
              return true;
            })
            .map(chunkFilePath =>
              assetType === 'css'
                ? `<link rel="stylesheet" type="text/css" href="${chunkFilePath}" />`
                : `<script src="${chunkFilePath}"></script>`,
            )
            .join(
              '\n  ',
            )}\n  <!-- DEV bundle: ${bundleName} ${assetType} END -->`;
        }
        return match;
      },
    );
  }
  return html;
}

function copyHeaders(originalResponse, response) {
  response.statusCode = originalResponse.statusCode;
  response.statusMessage = originalResponse.statusMessage;
  if (response.setHeader) {
    let keys = Object.keys(originalResponse.headers);
    if (isHTML(originalResponse)) {
      keys = keys.filter(
        key => key !== 'content-encoding' && key !== 'content-length',
      );
    }
    keys.forEach(key => {
      let value = originalResponse.headers[key];
      if (key === 'set-cookie') {
        // remove cookie domain
        value = Array.isArray(value) ? value : [value];
        value = value.map(x => x.replace(/Domain=[^;]+?/i, ''));
      } else if (key === 'location') {
        // set redirects to use local URL
        value = (value || '').replace(backend, '');
      }
      response.setHeader(key, value);
    });
  } else {
    response.headers = originalResponse.headers;
  }
}

/**
 * Manipulate HTML server response to replace asset files with
 * local webpack-dev-server build.
 */
function processHTML(proxyResponse, response) {
  let body = Buffer.from([]);
  let originalResponse = proxyResponse;

  // decode GZIP response
  if (originalResponse.headers['content-encoding'] === 'gzip') {
    const gunzip = zlib.createGunzip();
    originalResponse.pipe(gunzip);
    originalResponse = gunzip;
  }

  originalResponse
    .on('data', data => {
      body = Buffer.concat([body, data]);
    })
    .on('end', () => {
      response.end(toDevHTML(body.toString()));
    });
}

// make sure the manifest file exists
fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
fs.closeSync(fs.openSync(MANIFEST_FILE, 'as+'));
// watch it as webpack-dev-server updates it
fs.watch(MANIFEST_FILE, loadManifest);

module.exports = {
  context: '/',
  target: backend,
  hostRewrite: true,
  changeOrigin: true,
  cookieDomainRewrite: '', // remove cookie domain
  selfHandleResponse: true, // so that the onProxyRes takes care of sending the response
  onProxyRes(proxyResponse, request, response) {
    try {
      copyHeaders(proxyResponse, response);
      if (isHTML(response)) {
        processHTML(proxyResponse, response);
      } else {
        proxyResponse.pipe(response);
      }
      response.flushHeaders();
    } catch (e) {
      response.setHeader('content-type', 'text/plain');
      response.write(`Error requesting ${request.path} from proxy:\n\n`);
      response.end(e.stack);
    }
  },
};
