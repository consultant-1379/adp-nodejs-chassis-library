import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import ChainString from '../logHelpers/ChainString.js';
import ConfigManager from '../../src/config/configManager.js';

const configMock = {
  attribute1: 'some attribute',
  attribute2: 'other attribute',
  boolean: true,
};

const invalidConfig = {
  boolean: 5,
};

const mockSchema = {
  $schema: 'http://json-schema.org/draft-04/schema',
  type: 'object',
  properties: {
    attribute1: {
      type: 'string',
    },
    attribute2: {
      type: 'string',
    },
    boolean: {
      type: 'boolean',
    },
  },
};

const TEST_URL = '/api/config';

const TEST_INVALID_CONFIG = 'api/invalid-config';

const SCHEMA_VALIDATION_ERROR = 'The default config does not comply to the validation schema';

describe('Unit test for configManager module', () => {
  let log;

  const loggerMock = {
    error: (text) => {
      log.error(text);
    },
    info: (text) => {
      log.info(text);
    },
    debug: (text) => {
      log.debug(text);
    },
  };

  before(() => {
    log = new ChainString();
  });

  afterEach(() => {
    fetchMock.restore();
    log.clear();
  });
  it('Expects ConfigManager to exist', () => {
    expect(ConfigManager).not.to.be.undefined;
  });

  it("Must fail if the default config doesn't comply to schema", () => {
    let cm;
    try {
      cm = new ConfigManager({
        defaultConfig: invalidConfig,
        schema: mockSchema,
        path: TEST_URL,
      });
    } catch ({ message }) {
      expect(message).to.equal(SCHEMA_VALIDATION_ERROR);
    }
    expect(cm).to.be.undefined;
  });

  it('Falls back on default config if the returned from backend is not compliant to validator', async () => {
    fetchMock.mock(TEST_INVALID_CONFIG, invalidConfig);
    const loggedError = `Error: Deployment config is invalid: instance.boolean is not of a type(s) boolean`;
    const cm = new ConfigManager({
      defaultConfig: configMock,
      schema: mockSchema,
      path: TEST_INVALID_CONFIG,
    });
    let config = await cm.getConfig();
    expect(config).to.be.equal(configMock);
    cm.setLogger(loggerMock);
    config = await cm.getConfig();
    expect(config).to.be.equal(configMock);
    expect(log.getValue()).to.be.equal(loggedError);
  });

  it('Falls back on default config if fetching fails', async () => {
    const errorMsg = `Failed to parse URL from ${TEST_URL}`;
    const loggedError = `Error: Reading deployment config failed: ${errorMsg}`;
    const cm = new ConfigManager({
      defaultConfig: configMock,
      schema: mockSchema,
      path: TEST_URL,
    });
    try {
      await cm.initConfig();
    } catch (e) {
      expect(e).to.be.undefined('Error was not caught');
    }
    cm.setLogger(loggerMock);
    try {
      await cm.initConfig();
    } catch (e) {
      expect(e).to.be.undefined('Error was not caught');
    }
    expect(log.getValue()).to.be.equal(loggedError);
  });
});
