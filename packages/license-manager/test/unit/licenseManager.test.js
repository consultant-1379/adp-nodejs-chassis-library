import { expect } from 'chai';
import * as td from 'testdouble';

const REQ = 'http://test_hostname:1111/license-manager/api/v1/licenses/requests';

const TLS_AGENT = 'tlsAgent';
const LICENSES = [
  {
    keyId: 'keyId_test',
    type: 'test_type',
  },
];
const PRODUCT_TYPE = 'test_product_type';
const LICENSES_INFO = 'testLicensesInfo';

let licenseManager;
let passedOpts = {};
const baseLMConfig = {
  enabled: false,
  tls: {
    enabled: false,
    verifyServerCert: true,
    sendClientCert: true,
  },
  tlsPort: 2222,
  httpPort: 1111,
  hostname: 'test_hostname',
  productType: PRODUCT_TYPE,
  licenses: LICENSES,
};
const loggerMock = {
  error: () => true,
  info: () => true,
  debug: () => true,
};
const nodeFetchMock = (req, options) => {
  passedOpts = { req, options };
  return Promise.resolve({
    json: () => Promise.resolve(LICENSES_INFO),
    status: 200,
  });
};

describe('Unit tests for licenseManager.js', () => {
  const mockModules = async () => {
    await td.replaceEsm('node-fetch', null, nodeFetchMock);
    const { LicenseManager } = await import('../../src/index.js');
    licenseManager = new LicenseManager({
      licenseManagerConfig: baseLMConfig,
      useHttps: false,
      logger: loggerMock,
      secureContext: true,
      tlsAgent: TLS_AGENT,
    });
    td.reset();
  };

  beforeEach(async () => {
    await mockModules();
  });

  it('licenseManager should have required methods', () => {
    expect(licenseManager.readLicensesInfo).to.be.not.undefined;
  });

  it('should send correct request', async () => {
    const data = JSON.stringify({
      productType: PRODUCT_TYPE,
      licenses: LICENSES,
    });

    const licensesInfo = await licenseManager.readLicensesInfo();
    const { req, options } = passedOpts;
    expect(req).to.be.equal(REQ);
    expect(options.method).to.be.equal('POST');
    expect(options.body).to.be.equal(data);
    expect(licensesInfo).to.be.equal(LICENSES_INFO);
  });
});
