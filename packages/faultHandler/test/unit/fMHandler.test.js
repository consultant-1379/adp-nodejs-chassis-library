import { expect } from 'chai';
import { createRequire } from 'module';
import * as td from 'testdouble';

const require = createRequire(import.meta.url);
const faultIndicationMap = require('../mocks/dummyfiles/fault-indication-map.json');

const TLS_AGENT = 'tlsAgent';
const FAULT_KEY = 'SAMPLE';
const REQ = 'https://eric-fh-alarm-handler:6006/alarm-handler/v1/fault-indications';
const REQ_2 = 'http://eric-fh-alarm-handler:6005/alarm-handler/v1/fault-indications';

const loggingMock = {
  getLogger() {
    return {
      error(message) {
        return message;
      },
      info(message) {
        return message;
      },
    };
  },
};

const configManagerMock = (
  isEnabled,
  isTlsEnabled,
  serviceName = 'eric-adp-gui-aggregator-service',
) => ({
  getFaultManagerConfig: () => ({
    hostname: 'eric-fh-alarm-handler',
    tlsPort: 6006,
    httpPort: 6005,
    serviceName,
    enabled: isEnabled,
    tls: {
      enabled: isTlsEnabled,
      verifyServerCert: true,
      sendClientCert: true,
    },
  }),
});

const jsonschema = {
  Validator: class {
    validate() {
      return {
        valid: true,
      };
    }
  },
};

let passedOpts = {};

const nodeFetchMock = (req, options) => {
  passedOpts = { req, options };
  return Promise.resolve({
    status: 200,
  });
};

const mockModules = async ({ isEnabled = true, isTlsEnabled = false, tlsAgent = null }) => {
  await td.replaceEsm('jsonschema', jsonschema);
  await td.replaceEsm('node-fetch', null, nodeFetchMock);
  const configManager = configManagerMock(isEnabled, isTlsEnabled);
  const FMHandler = (await import('../../src/index.js')).FaultHandler;
  td.reset();
  return new FMHandler({
    faultManagerConfig: configManager.getFaultManagerConfig(),
    faultIndicationMap,
    logger: loggingMock.getLogger(),
    useHttps: isTlsEnabled,
    tlsAgent,
  });
};

describe('Unit tests for fMHandler', () => {
  describe('Testing working fmHandler', () => {
    let fMHandler;

    before(async () => {
      fMHandler = await mockModules({
        isEnabled: true,
        isTlsEnabled: true,
        tlsAgent: TLS_AGENT,
      });
    });

    it('should send correct request', async () => {
      await fMHandler.produceFaultIndication({
        fault: FAULT_KEY,
      });
      const { req, options } = passedOpts;
      expect(req).to.be.equal(REQ);
      expect(options.method).to.be.equal('POST');
      expect(options.body).to.be.equal(JSON.stringify(faultIndicationMap[FAULT_KEY]));
    });

    it('can set fault manager config', async () => {
      const configManager = configManagerMock(true, false, 'test');
      const faultManagerConfig = configManager.getFaultManagerConfig();
      fMHandler.setConfig({ faultManagerConfig });
      await fMHandler.produceFaultIndication({ fault: 'SAMPLE' });
      const { req } = passedOpts;
      expect(req).to.be.equal(REQ_2);
    });

    it('throws exception if tlsAgent is missing and tls is on', async () => {
      const logger = loggingMock.getLogger();
      logger.info = td.replace(logger, 'info');
      const configManager = configManagerMock(true, false, 'test');
      const faultManagerConfig = configManager.getFaultManagerConfig();
      fMHandler.setConfig({ logger, faultManagerConfig, useHttps: true, tlsAgent: false });
      await fMHandler.produceFaultIndication({ fault: 'SAMPLE' });
      td.verify(logger.info('TLS is on, but certificates are not read yet.'), { times: 1 });
    });
  });
});
