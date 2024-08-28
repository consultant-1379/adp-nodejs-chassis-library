import { expect } from 'chai';
import https from 'https';
import { createRequire } from 'module';
import { EventEmitter } from 'events';
import td from '../../testdouble.js';
import nodeFetchMock, { HeadersMock, RequestMock } from '../../mocks/nodeFetch.mock.js';
import {
  QUERY_CONFIG_NAME,
  CONFIG_FILE_NAME,
  CONFIG_FETCH_RETRY_PERIOD,
  CONFIG_FETCH_MAX_RETRY_PERIOD,
  NODE_FETCH,
  DEFAULT_CONTEXT,
  SERVICE_WITH_CONFIG_CONTEXT_PATH,
  SERVICE_WITH_BASEURL,
  SERVICE_WITHOUT_BASEURL,
  SERVICE_WITH_HTTPS,
  SERVICE_WITH_FAILING_URL_WHICH_REJECTED,
  SERVICE_RESTORED_AFTER_REJECTED,
  SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS,
  SERVICE_WITH_PROTOCOL,
  SERVICE_WITH_DELAYED_FAILING_URL,
  SERVICE_WITH_DELAYED_PASSING_URL,
  DEFAULT_CONFIG,
  SERVICE_WITH_INVALID_CONFIG,
  SERVICE_WITH_OTHER_NAME,
  SERVICE_FOR_DELETE,
} from './constants.js';
import dstMock from '../../mocks/dst.mock.js';

const require = createRequire(import.meta.url);
const appConfig = require('../../mocks/configs/domain-app1.config.json');
const appConfigForConfigContext = require('../../mocks/configs/domain-app3.config.json');

const configSchema = require('../../mocks/schema/simple-config-schema.json');

const SERVICE_WITH_CONFIG_CONTEXT_PATH_RESULT = {
  [SERVICE_WITH_CONFIG_CONTEXT_PATH.name]: {
    ...SERVICE_WITH_CONFIG_CONTEXT_PATH,
    meta: appConfigForConfigContext,
  },
};

const SERVICE_WITH_BASEURL_RESULT = {
  [SERVICE_WITH_BASEURL.name]: {
    ...SERVICE_WITH_BASEURL,
    meta: appConfig,
  },
};

const SERVICE_WITHOUT_BASEURL_RESULT = {
  [SERVICE_WITHOUT_BASEURL.name]: {
    ...SERVICE_WITHOUT_BASEURL,
    meta: appConfig,
  },
};

const SERVICE_WITH_HTTPS_RESULT = {
  [SERVICE_WITH_HTTPS.name]: {
    ...SERVICE_WITH_HTTPS,
    meta: appConfig,
  },
};

const SERVICE_WITHOUT_CONFIG_RESULT = {
  [SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS.name]: {
    ...SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS,
    meta: DEFAULT_CONFIG,
  },
};

const SERVICE_RESTORED_AFTER_REJECTED_RESULT = {
  [SERVICE_RESTORED_AFTER_REJECTED.name]: {
    ...SERVICE_RESTORED_AFTER_REJECTED,
    meta: appConfig,
  },
};

const SERVICE_WITH_OTHER_NAME_RESULT = {
  [SERVICE_WITH_OTHER_NAME.name]: {
    ...SERVICE_WITH_OTHER_NAME,
    meta: appConfig,
  },
};

const serviceCollectionMock = new EventEmitter();

const certificateManagerMock = {
  getTLSOptions: () => ({
    secureContext: {},
    tlsAgent: new https.Agent(),
  }),
  on: () => true,
};

function getErrorMsgFromDeleteService(configQueryService) {
  let error;
  try {
    configQueryService.deleteService(SERVICE_FOR_DELETE);
  } catch (e) {
    error = e;
  }

  return error;
}

describe('Unit tests for ConfigQueryService', () => {
  describe('Basic tests', () => {
    let configQueryService;
    const mockModules = async () => {
      await td.replaceEsm(
        NODE_FETCH,
        { Headers: HeadersMock, Request: RequestMock },
        nodeFetchMock,
      );
      const ConfigQueryService = (await import('../../../src/configQuery/configQueryService.js'))
        .default;

      configQueryService = new ConfigQueryService({
        serviceCollection: serviceCollectionMock,
        certificateManager: certificateManagerMock,
        telemetryService: dstMock,
        configFetchRetryPeriod: CONFIG_FETCH_RETRY_PERIOD,
        configFetchMaxRetryPeriod: CONFIG_FETCH_MAX_RETRY_PERIOD,
        configQueryList: [
          {
            configName: QUERY_CONFIG_NAME,
            configFileName: CONFIG_FILE_NAME,
            schema: configSchema,
          },
        ],
      });
      td.reset();
    };

    before(async () => {
      await mockModules();
    });

    afterEach(() => {
      td.reset();
    });

    it('can get configuration metadata from annotated context root', async () => {
      await configQueryService.serviceHandler(SERVICE_WITH_CONFIG_CONTEXT_PATH);

      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_WITH_CONFIG_CONTEXT_PATH_RESULT,
      );
    });

    it('can update', async () => {
      await configQueryService.serviceHandler(SERVICE_WITH_BASEURL);
      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_WITH_BASEURL_RESULT,
      );
    });

    it('can delete service on invalid schema exception', async () => {
      await configQueryService.serviceHandler(SERVICE_WITH_OTHER_NAME);
      expect(Object.keys(configQueryService.getConfig(QUERY_CONFIG_NAME)).length).to.be.eq(2);
      await configQueryService.serviceHandler(SERVICE_WITH_INVALID_CONFIG);
      expect(Object.keys(configQueryService.getConfig(QUERY_CONFIG_NAME)).length).to.be.eq(1);
      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_WITH_OTHER_NAME_RESULT,
      );
      configQueryService.deleteService(SERVICE_WITH_OTHER_NAME);
    });

    it('cancels earlier retry loop if a new update comes in for a service', async () => {
      setTimeout(async (done) => {
        const serviceConfigKey = `${SERVICE_WITH_DELAYED_FAILING_URL.name}_${CONFIG_FILE_NAME}`;
        expect(configQueryService.activeFetchLoops[serviceConfigKey]).to.be.eq(1); // previous loop is still running
        await configQueryService.serviceHandler(SERVICE_WITH_DELAYED_PASSING_URL); // will pass at the first try
        expect(configQueryService.activeFetchLoops[serviceConfigKey]).not.to.exist; // previous loop is killed, activeLoops count is ` after this successful call
        done();
      }, 1);

      await configQueryService.serviceHandler(SERVICE_WITH_DELAYED_FAILING_URL); // this would keep retrying forever
    });

    it('can handle relative urls', async () => {
      await configQueryService.serviceHandler(SERVICE_WITHOUT_BASEURL);
      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_WITHOUT_BASEURL_RESULT,
      );
    });

    it('can delete config', () => {
      configQueryService.deleteService(SERVICE_WITHOUT_BASEURL);
      expect(Object.keys(configQueryService.getConfig(QUERY_CONFIG_NAME)).length).to.be.eq(0);
    });

    it('can handle https services', async () => {
      await configQueryService.serviceHandler(SERVICE_WITH_HTTPS);
      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(SERVICE_WITH_HTTPS_RESULT);
    });

    it('trigger service-config-deleted event on service config is deleted', async () => {
      const expectedEventCallback = td.func();
      const expectedEmitArguments = {
        service: SERVICE_WITH_HTTPS,
      };
      configQueryService.on('service-config-deleted', expectedEventCallback);

      await configQueryService.deleteService(SERVICE_WITH_HTTPS);
      td.verify(expectedEventCallback(expectedEmitArguments), { times: 1 });
    });

    it('trigger service-config-updated event on service config is added or updates', async () => {
      const expectedEventCallback = td.func();
      const expectedEmitArguments = {
        configName: QUERY_CONFIG_NAME,
        service: SERVICE_WITH_BASEURL,
      };
      configQueryService.on('service-config-updated', expectedEventCallback);

      await configQueryService.serviceHandler(SERVICE_WITH_BASEURL);
      td.verify(expectedEventCallback(expectedEmitArguments), { times: 1 });
    });

    it('can request data', async () => {
      const { successfulResponse } = await configQueryService.fetchConfig(
        SERVICE_WITH_BASEURL,
        CONFIG_FILE_NAME,
      );
      const meta = await successfulResponse.json();
      expect(successfulResponse.ok).to.be.true;
      expect(meta).to.deep.eq(appConfig);
    });

    it('can handle failed requests with promise fulfills', async () => {
      const { successfulResponse, failedResponse, error } = await configQueryService.fetchConfig(
        SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS,
      );
      expect(successfulResponse).to.be.undefined;
      expect(failedResponse.ok).to.be.false;
      expect(error).to.be.undefined;
    });

    it('can handle failed requests with promise rejected', async () => {
      const { successfulResponse, failedResponse, error } = await configQueryService.fetchConfig(
        SERVICE_WITH_FAILING_URL_WHICH_REJECTED,
      );
      expect(successfulResponse).to.be.undefined;
      expect(failedResponse).to.be.undefined;
      expect(error.message).to.equal('No such app.');
    });

    it('can handle if deleteService called more than once in order to delete a service', async () => {
      let error;
      await configQueryService.serviceHandler(SERVICE_FOR_DELETE);

      error = getErrorMsgFromDeleteService(configQueryService);
      expect(error).to.equal(undefined);

      error = getErrorMsgFromDeleteService(configQueryService);
      expect(error).to.equal(undefined);
    });

    it('can handle if deleteService called but the service not in the collection', async () => {
      await configQueryService.serviceHandler(SERVICE_WITH_BASEURL);
      const error = getErrorMsgFromDeleteService(configQueryService);

      expect(error).to.equal(undefined);
    });
  });

  describe('Error handling tests', () => {
    const LIMIT_OF_TRIES = 1;
    let configQueryService;
    const mockModules = async () => {
      await td.replaceEsm(
        NODE_FETCH,
        { Headers: HeadersMock, Request: RequestMock },
        nodeFetchMock,
      );
      const ConfigQueryService = (await import('../../../src/configQuery/configQueryService.js'))
        .default;

      configQueryService = new ConfigQueryService({
        serviceCollection: serviceCollectionMock,
        certificateManager: certificateManagerMock,
        telemetryService: dstMock,
        configFetchRetryPeriod: CONFIG_FETCH_RETRY_PERIOD,
        configFetchMaxRetryPeriod: CONFIG_FETCH_MAX_RETRY_PERIOD,
        configQueryList: [
          {
            configName: QUERY_CONFIG_NAME,
            configFileName: CONFIG_FILE_NAME,
            schema: configSchema,
            allowEmptyConfig: true,
            configDefault: DEFAULT_CONFIG,
            limitOfTries: LIMIT_OF_TRIES,
          },
        ],
      });
      td.reset();
    };

    beforeEach(async () => {
      await mockModules();
    });

    afterEach(() => {
      td.reset();
    });

    it('returns default config when the responses are http errors for every tries', async () => {
      const fetchConfigSpy = td.spyProp(configQueryService, 'fetchConfig');
      await configQueryService.serviceHandler(SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS);
      td.verify(fetchConfigSpy(), { ignoreExtraArgs: true, times: LIMIT_OF_TRIES });

      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_WITHOUT_CONFIG_RESULT,
      );
    });

    it('continues fetching until success if there is a connection error', async () => {
      const numberOfTries = LIMIT_OF_TRIES * 5;
      const fetchConfigSpy = td.spyProp(configQueryService, 'fetchConfig');

      setTimeout(async () => {
        await configQueryService.serviceHandler(SERVICE_RESTORED_AFTER_REJECTED);
        td.verify(fetchConfigSpy(), { ignoreExtraArgs: true, times: numberOfTries });
      }, CONFIG_FETCH_RETRY_PERIOD * numberOfTries);

      await configQueryService.serviceHandler(SERVICE_WITH_FAILING_URL_WHICH_REJECTED);

      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq(
        SERVICE_RESTORED_AFTER_REJECTED_RESULT,
      );
    });

    it('continues fetching until deleted if there is a connection error', async () => {
      const numberOfTries = LIMIT_OF_TRIES * 5;
      const fetchConfigSpy = td.spyProp(configQueryService, 'fetchConfig');

      setTimeout(async () => {
        await configQueryService.deleteService(SERVICE_WITH_FAILING_URL_WHICH_REJECTED);
        td.verify(fetchConfigSpy(), { ignoreExtraArgs: true, times: numberOfTries });
      }, CONFIG_FETCH_RETRY_PERIOD * numberOfTries);

      await configQueryService.serviceHandler(SERVICE_WITH_FAILING_URL_WHICH_REJECTED);

      expect(configQueryService.getConfig(QUERY_CONFIG_NAME)).to.deep.eq({});
    });
  });

  describe('Protocol', () => {
    let stub;
    let configQueryService;

    const mockWithSpy = async () => {
      stub = td.func();
      await td.replaceEsm(NODE_FETCH, { Headers: HeadersMock, Request: RequestMock }, stub);
      const ConfigQueryService = (await import('../../../src/configQuery/configQueryService.js'))
        .default;
      configQueryService = new ConfigQueryService({
        serviceCollection: serviceCollectionMock,
        certificateManager: certificateManagerMock,
        telemetryService: dstMock,
        configQueryList: [
          {
            configName: QUERY_CONFIG_NAME,
            configFileName: CONFIG_FILE_NAME,
            schema: configSchema,
          },
        ],
      });
      td.reset();
    };

    before(async () => {
      await mockWithSpy();
    });

    afterEach(() => {
      td.reset();
    });

    it('can set protocol if protocol is given', async () => {
      td.when(stub(), { ignoreExtraArgs: true }).thenResolve({ ok: true });
      await configQueryService.fetchConfig(SERVICE_WITH_PROTOCOL, CONFIG_FILE_NAME);
      td.verify(stub(), {
        ignoreExtraArgs: true,
        times: 1,
      });

      td.verify(
        stub(
          td.matchers.contains({
            url: `${SERVICE_WITH_PROTOCOL.protocol}://${SERVICE_WITH_PROTOCOL.serviceurl}${DEFAULT_CONTEXT}/config.json`,
          }),
        ),
        { ignoreExtraArgs: true },
      );
      expect(td.explain(stub).calls[0].args[0].agent).to.be.instanceOf(https.Agent);
    });
  });
});
