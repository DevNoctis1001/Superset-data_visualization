/*
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

import { IFRAME_COMMS_MESSAGE_TYPE } from './const';

/**
 * The function to fetch a guest token from your Host App's backend server.
 * The Host App backend must supply an API endpoint
 * which returns a guest token with appropriate resource access.
 */
export type GuestTokenFetchFn = () => Promise<string>;

export type EmbedDashboardParams = {
  /** The id provided by the embed configuration UI in Superset */
  id: string
  /** The domain where Superset can be located, with protocol, such as: https://superset.example.com */
  supersetDomain: string
  /** The html element within which to mount the iframe */
  mountPoint: HTMLElement
  /** A function to fetch a guest token from the Host App's backend server */
  fetchGuestToken: GuestTokenFetchFn
}

/**
 * Embeds a Superset dashboard into the page using an iframe.
 */
export async function embedDashboard({
  id,
  supersetDomain,
  mountPoint,
  fetchGuestToken
}: EmbedDashboardParams) {
  function log(...info: unknown[]) {
    console.debug(`[superset-embedded-sdk][dashboard ${id}]`, ...info);
  }

  log('embedding');

  async function mountIframe(): Promise<MessagePort> {
    return new Promise(resolve => {
      const iframe = document.createElement('iframe');

      // setup the iframe's sandbox configuration
      iframe.sandbox.add("allow-same-origin"); // needed for postMessage to work
      iframe.sandbox.add("allow-scripts"); // obviously the iframe needs scripts
      iframe.sandbox.add("allow-presentation"); // for fullscreen charts
      // add these ones if it turns out we need them:
      // iframe.sandbox.add("allow-top-navigation");
      // iframe.sandbox.add("allow-forms");

      // add the event listener before setting src, to be 100% sure that we capture the load event
      iframe.addEventListener('load', () => {
        // MessageChannel allows us to send and receive messages smoothly between our window and the iframe
        // See https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
        const commsChannel = new MessageChannel();
        const ourPort = commsChannel.port1;
        const theirPort = commsChannel.port2;

        // Send one of the message channel ports to the iframe to initialize embedded comms
        // See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        // we know the content window isn't null because we are in the load event handler.
        iframe.contentWindow!.postMessage(
          { type: IFRAME_COMMS_MESSAGE_TYPE, handshake: "port transfer" },
          supersetDomain,
          [theirPort],
        )
        log('sent message channel to the iframe');

        // return our port from the promise
        resolve(ourPort);
      });

      iframe.src = `${supersetDomain}/dashboard/${id}/embedded`;
      mountPoint.replaceChildren(iframe);
      log('placed the iframe')
    });
  }

  const [guestToken, ourPort] = await Promise.all([
    fetchGuestToken(),
    mountIframe()
  ]);

  ourPort.postMessage({ guestToken });
  log('sent guest token');

  function unmount() {
    log('unmounting');
    mountPoint.replaceChildren();
  }

  return {
    unmount
  };
}
