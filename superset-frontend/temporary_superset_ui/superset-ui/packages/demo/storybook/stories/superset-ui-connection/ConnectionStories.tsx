import React from 'react';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import { bigNumberFormData } from '@superset-ui/chart/test/fixtures/formData';

import VerifyCORS, { Props as VerifyCORSProps } from '../../shared/components/VerifyCORS';
import Expandable from '../../shared/components/Expandable';

const REQUEST_METHODS = ['GET', 'POST'];

export default {
  title: 'Core Packages|@superset-ui/connection',
  decorators: [withKnobs],
};

export const configureCORS = () => {
  const host = text('Superset App host for CORS request', 'localhost:9000');
  const endpoint = text('Endpoint to test (blank to test auth only)', '');
  const method = endpoint ? select('Request method', REQUEST_METHODS, 'POST') : undefined;
  const postPayload =
    endpoint && method === 'POST'
      ? text('Optional POST payload', JSON.stringify({ form_data: bigNumberFormData }))
      : undefined;

  return (
    <div style={{ margin: 16 }}>
      <VerifyCORS
        host={host}
        endpoint={endpoint}
        method={method as VerifyCORSProps['method']}
        postPayload={`${postPayload}`}
      >
        {({ payload }) => (
          <>
            <div className="alert alert-success">Success! Update knobs below to try again</div>
            <br />
            <Expandable expandableWhat="payload">
              <br />
              <pre style={{ fontSize: 11 }}>{JSON.stringify(payload, null, 2)}</pre>
            </Expandable>
          </>
        )}
      </VerifyCORS>
    </div>
  );
};
