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
import { Layout } from 'antd';
import { css } from '@emotion/core';
import { GithubOutlined, SlackSquareOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const footerStyle = css`
  background-color: #323232;
  text-align: center;
  color: #ccc;
  .apacheLinks {
    a {
      color: white;
      margin: 5px;
    }
  }
`;

const copyrightStyle = css`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`;
const apacheLinksStyle = css`
  text-align: center;
`;
const iconContainerStyle = css`
  height: 60px;
  background-color: #323232;
  display: flex;
  flex-direction: row;
  .icons {
    text-align: center;
    width: 100%;
    svg {
      margin-top: 15px;
      color: #ccc;
      width: 30px;
      height: 30px;
      margin-left: 10px;
    }
    .svg {
      width: 30px;
      height: 30px;
      margin-top: -15px;
      margin-left: 10px;
    }
  }
`;

const LayoutFooter = () => (
  <>
    <Footer css={footerStyle}>
      <div css={apacheLinksStyle} className="apacheLinks">
        <a href="https://www.apache.org/security/" target="_blank" rel="noreferrer">
          Security &nbsp;|
        </a>
        <a href="https://www.apache.org/foundation/sponsorship.html" target="_blank" rel="noreferrer">
          Donate &nbsp;|
        </a>

        <a href="https://www.apache.org/foundation/thanks.html" target="_blank" rel="noreferrer">
          Thanks
        </a>
      </div>
      <div css={iconContainerStyle}>
        <div className="icons">
          <a
            href="https://apache-superset.slack.com/join/shared_invite/zt-g8lpruog-HeqpgYrwdfrD5OYhlU7hPQ#/"
            target="_blank"
            rel="noreferrer"
          >
            <SlackSquareOutlined className="icon" />
          </a>
          <a href="https://github.com/apache/incubator-superset" target="_blank" rel="noreferrer">
            <GithubOutlined className="icon" />
          </a>
          <a
            href="https://stackoverflow.com/questions/tagged/apache-superset+superset"
            target="_blank"
            rel="noreferrer"
          >
            <img alt="StackOverflow" src="/images/so-icon.svg" className="icon svg" />
          </a>
        </div>
      </div>
      <div css={copyrightStyle}>
        © Copyright
        {' '}
        {new Date().getFullYear()}
        ,
        <a href="http://www.apache.org/" target="_blank" rel="noreferrer">
          &nbsp;The Apache Software Fountation
        </a>
        , &nbsp;Licensed under the Apache
        <a href="https://www.apache.org/licenses/" target="_blank" rel="noreferrer">
          &nbsp;License.
        </a>
        {' '}
        <br />
        <div>
          Disclaimer: Apache Superset is an effort undergoing incubation at The Apache Software
          Foundation (ASF), sponsored by the Apache Incubator. Incubation is required of all newly
          accepted projects until a further review indicates that the infrastructure,
          communications, and decision making process have stabilized in a manner consistent with
          other successful ASF projects. While incubation status is not necessarily a reflection of
          the completeness or stability of the code, it does indicate that the project has yet to be
          fully endorsed by the ASF.
        </div>
      </div>
    </Footer>
  </>
);

export default LayoutFooter;
