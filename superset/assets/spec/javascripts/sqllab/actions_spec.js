/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import * as actions from '../../../src/SqlLab/actions';
import { query } from './fixtures';

describe('async actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = sinon.spy();
  });

  afterEach(fetchMock.resetHistory);

  describe('saveQuery', () => {
    const saveQueryEndpoint = 'glob:*/savedqueryviewapi/api/create';
    fetchMock.post(saveQueryEndpoint, 'ok');

    it('posts to the correct url', () => {
      expect.assertions(1);
      const thunk = actions.saveQuery(query);

      return thunk((/* mockDispatch */) => ({})).then(() => {
        expect(fetchMock.calls(saveQueryEndpoint)).toHaveLength(1);
      });
    });

    it('posts the correct query object', () => {
      const thunk = actions.saveQuery(query);

      return thunk((/* mockDispatch */) => ({})).then(() => {
        const call = fetchMock.calls(saveQueryEndpoint)[0];
        const formData = call[1].body;
        Object.keys(query).forEach((key) => {
          expect(formData.get(key)).toBeDefined();
        });
      });
    });
  });

  describe('fetchQueryResults', () => {
    const fetchQueryEndpoint = 'glob:*/superset/results/*';
    fetchMock.get(fetchQueryEndpoint, '{ "data": "" }');

    const makeRequest = () => {
      const actionThunk = actions.fetchQueryResults(query);
      return actionThunk(dispatch);
    };

    it('makes the fetch request', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(fetchMock.calls(fetchQueryEndpoint)).toHaveLength(1);
      });
    });

    it('calls requestQueryResults', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(dispatch.args[0][0].type).toBe(actions.REQUEST_QUERY_RESULTS);
      });
    });

    it('calls querySuccess on fetch success', () =>
      makeRequest().then(() => {
        expect(dispatch.callCount).toBe(2);
        expect(dispatch.getCall(1).args[0].type).toBe(actions.QUERY_SUCCESS);
      }));

    it('calls queryFailed on fetch error', () => {
      expect.assertions(2);
      fetchMock.get(
        fetchQueryEndpoint,
        { throws: { error: 'error text' } },
        { overwriteRoutes: true },
      );

      return makeRequest().then(() => {
        expect(dispatch.callCount).toBe(2);
        expect(dispatch.getCall(1).args[0].type).toBe(actions.QUERY_FAILED);
      });
    });
  });

  describe('runQuery', () => {
    const runQueryEndpoint = 'glob:*/superset/sql_json/*';
    fetchMock.post(runQueryEndpoint, { data: '' });

    const makeRequest = () => {
      const request = actions.runQuery(query);
      return request(dispatch);
    };

    it('makes the fetch request', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(fetchMock.calls(runQueryEndpoint)).toHaveLength(1);
      });
    });

    it('calls startQuery', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(dispatch.args[0][0].type).toBe(actions.START_QUERY);
      });
    });

    it('calls querySuccess on fetch success', () => {
      expect.assertions(3);

      return makeRequest().then(() => {
        expect(dispatch.callCount).toBe(2);
        expect(dispatch.getCall(0).args[0].type).toBe(actions.START_QUERY);
        expect(dispatch.getCall(1).args[0].type).toBe(actions.QUERY_SUCCESS);
      });
    });

    it('calls queryFailed on fetch error', () => {
      expect.assertions(2);

      fetchMock.post(
        runQueryEndpoint,
        { throws: { error: 'error text' } },
        { overwriteRoutes: true },
      );

      return makeRequest().then(() => {
        expect(dispatch.callCount).toBe(2);
        expect(dispatch.getCall(1).args[0].type).toBe(actions.QUERY_FAILED);
      });
    });
  });

  describe('postStopQuery', () => {
    const stopQueryEndpoint = 'glob:*/superset/stop_query/*';
    fetchMock.post(stopQueryEndpoint, {});

    const makeRequest = () => {
      const request = actions.postStopQuery(query);
      return request(dispatch);
    };

    it('makes the fetch request', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(fetchMock.calls(stopQueryEndpoint)).toHaveLength(1);
      });
    });


    it('calls stopQuery', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        expect(dispatch.getCall(0).args[0].type).toBe(actions.STOP_QUERY);
      });
    });

    it('sends the correct data', () => {
      expect.assertions(1);

      return makeRequest().then(() => {
        const call = fetchMock.calls(stopQueryEndpoint)[0];
        expect(call[1].body.get('client_id')).toBe(query.id);
      });
    });
  });
});
