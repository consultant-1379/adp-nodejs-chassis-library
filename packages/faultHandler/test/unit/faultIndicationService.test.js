import { expect } from 'chai';
import { createRequire } from 'module';
import * as td from 'testdouble';

const require = createRequire(import.meta.url);
const faultIndicationMap = require('../mocks/dummyfiles/fault-indication-map.json');

const FAULT_KEY = 'SAMPLE';

const configManagerMock = {
  getFaultManagerConfig: () => ({
    hostname: 'eric-fh-alarm-handler',
    tlsPort: 6006,
    httpPort: 6005,
    serviceName: 'eric-adp-gui-aggregator-service',
    tls: {
      enabled: false,
    },
  }),
};

const additionalParams = {
  FI_DEFAULTS: faultIndicationMap,
  serviceName: configManagerMock.getFaultManagerConfig().serviceName,
};

const jsonschema = {
  Validator: class {
    validate() {
      return {
        valid: true,
      };
    }
  },
};

const rewireFaultIndication = async () => {
  await td.replaceEsm('jsonschema', jsonschema);
  const faultIndication = await import('../../src/utils/faultIndicationService.js');
  td.reset();
  return faultIndication;
};

describe('Unit tests for faultIndicationService', () => {
  describe('Testing faultIndication', () => {
    let faultIndication;
    before(async () => {
      faultIndication = await rewireFaultIndication();
    });
    it('should return correct fault indication', () => {
      const faultInd = faultIndication.getFaultIndication({
        fault: FAULT_KEY,
        ...additionalParams,
      });
      const { faultName } = faultIndicationMap[FAULT_KEY];
      const { serviceName } = configManagerMock.getFaultManagerConfig();
      expect(faultInd.faultName).to.be.equal(faultName);
      expect(faultInd.serviceName).to.be.equal(serviceName);
    });
    it('should apply custom config for fault indication', () => {
      const defaultFI = faultIndicationMap[FAULT_KEY];
      const customConfig1 = {
        faultName: 'test',
      };
      const customConfig2 = {
        faultName: 'test1',
      };
      const faultInd1 = faultIndication.getFaultIndication({
        fault: FAULT_KEY,
        customConfig: customConfig1,
        ...additionalParams,
      });
      const conf1 = Object.assign(defaultFI, customConfig1);
      expect(faultInd1.faultName).to.be.equal(conf1.faultName);
      const faultInd2 = faultIndication.getFaultIndication({
        fault: FAULT_KEY,
        customConfig: customConfig2,
        ...additionalParams,
      });
      const conf2 = Object.assign(defaultFI, customConfig2);
      expect(faultInd2.faultName).to.be.equal(conf2.faultName);
    });
  });
});
