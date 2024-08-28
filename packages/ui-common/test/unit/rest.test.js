import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import td from '../../../../scripts/testdouble.js';

const parsedResponse = {
  attribute1: 'some attribute',
  attribute2: 'other attribute',
  boolean: true,
};

const loggerMock = {
  error: () => true,
  info: () => true,
  debug: () => true,
};

const validJsonResponse = JSON.stringify(parsedResponse);
const invalidJsonResponse = 'not a valid JSON string';

const PROTOCOL = 'http';
const HOST = 'www.test.com';
const PATH = '/test_path';
const TEST_URL = '/api/config';
const FULL_TEST_URL = `${PROTOCOL}://${HOST}${PATH}${TEST_URL}`;
const LOG_URL = '../ui-logging/v1/logs';

describe('Unit test for rest module', () => {
  let Rest;
  let rest;
  let logCall;
  let logger;

  const mockModules = async () => {
    Rest = (await import('../../src/rest/rest.js')).default;
    td.reset();
  };

  beforeEach(async () => {
    await mockModules();
    rest = new Rest();
    rest.setBaseContext({
      protocol: PROTOCOL,
      hostname: HOST,
      path: PATH,
    });
    rest.setLogger(loggerMock);
    logger = loggerMock;
  });

  afterEach(() => {
    fetchMock.restore();
    td.reset();
  });

  it(`can fetch based on uiConfig`, async () => {
    rest.setBaseContext({
      protocol: PROTOCOL,
      hostname: HOST,
      path: PATH,
    });

    fetchMock.mock(FULL_TEST_URL, {
      status: 200,
      body: validJsonResponse,
    });

    const response = await rest.makeRequest(TEST_URL);
    expect(response).to.deep.equal(parsedResponse);
  });

  it(`can fetch on root`, async () => {
    rest.setBaseContext({
      protocol: PROTOCOL,
      hostname: HOST,
      path: '/',
    });

    fetchMock.mock(`${PROTOCOL}://${HOST}${TEST_URL}`, {
      status: 200,
      body: validJsonResponse,
    });

    const response = await rest.makeRequest(TEST_URL);
    expect(response).to.deep.equal(parsedResponse);
  });

  it(`can fetch with relative path`, async () => {
    rest.setBaseContext({
      protocol: PROTOCOL,
      hostname: `${HOST}/first/second`,
      path: '/../..',
    });

    fetchMock.mock(`${PROTOCOL}://${HOST}${TEST_URL}`, {
      status: 200,
      body: validJsonResponse,
    });

    const response = await rest.makeRequest(TEST_URL);
    expect(response).to.deep.equal(parsedResponse);
  });

  it(`non-JSON response should be passed as-is`, async () => {
    fetchMock.mock(FULL_TEST_URL, {
      status: 200,
      body: invalidJsonResponse,
    });

    const response = await rest.makeRequest(TEST_URL);
    expect(response).to.be.equal(invalidJsonResponse);
  });

  it(`NOK response should be logged, HttpError should be thrown`, async () => {
    const response = {
      status: 404,
      body: '',
    };

    const logResponse = {
      status: 200,
      body: '',
    };
    logCall = td.spyProp(logger, 'error');
    fetchMock.mock(FULL_TEST_URL, response);
    fetchMock.mock(LOG_URL, logResponse);

    try {
      await rest.makeRequest(TEST_URL);
    } catch (error) {
      td.verify(logCall(), { ignoreExtraArgs: true, times: 1 });
      expect(error.name).to.be.eq('HttpError');
    }
  });

  it(`can perform fetchResponse`, async () => {
    fetchMock.mock(FULL_TEST_URL, {
      status: 200,
      body: validJsonResponse,
    });

    const response = await rest.fetchResponse(FULL_TEST_URL);
    const jsonResponse = await JSON.parse(await response.text());
    expect(jsonResponse).to.deep.equal(parsedResponse);
  });

  it(`fetchResponse NOK response should be logged, HttpError should be thrown`, async () => {
    const response = {
      status: 404,
      body: '',
    };

    const logResponse = {
      status: 200,
      body: '',
    };
    logCall = td.spyProp(logger, 'error');
    fetchMock.mock(FULL_TEST_URL, response);
    fetchMock.mock(LOG_URL, logResponse);

    try {
      await rest.fetchResponse(FULL_TEST_URL);
    } catch (error) {
      td.verify(logCall(), { ignoreExtraArgs: true, times: 1 });
      expect(error.name).to.be.eq('HttpError');
    }
  });
});
