import { expect } from 'chai';
import * as td from 'testdouble';

const EXISTING_CERT = 'tls.crt';
const EXISTING_CERT_DATA = 'cert';
const NON_EXISTENT_CERT = 'some.crt';
const SERVICE_NAME = 'service-1';
const EXPECTED_OPTIONS = {
  keepAlive: true,
  rejectUnauthorized: true,
  ca: EXISTING_CERT_DATA,
  ALPNProtocols: ['http/1.1'],
};

const loggerMock = ({ errorMock }) => ({
  info: () => true,
  error: errorMock,
  debug: () => true,
  warning: () => true,
});

const fsMock = () => ({
  readFileSync: (filePath) => {
    if (filePath.includes(EXISTING_CERT)) {
      return EXISTING_CERT_DATA;
    }
    return false;
  },
  existsSync: (filePath) => !!filePath.includes(EXISTING_CERT),
});

describe('Unit tests for NonTLSCertificateManager.js', () => {
  let nonTLSCertificateManager;
  const loggerErrorMock = td.func();

  const mockModules = async ({ certPath }) => {
    await td.replaceEsm('fs', fsMock());
    const { NonTLSCertificateManager } = await import('../../src/index.js');
    nonTLSCertificateManager = new NonTLSCertificateManager({
      serviceName: SERVICE_NAME,
      serverCertPath: certPath,
      logger: loggerMock({ errorMock: loggerErrorMock }),
    });
    td.reset();
  };

  it('should return appropriate TLS options', async () => {
    await mockModules({ certPath: EXISTING_CERT });

    const { tlsAgent } = nonTLSCertificateManager.getTLSOptions();
    expect(tlsAgent.keepAlive).to.be.true;
    expect(tlsAgent.options).to.deep.include(EXPECTED_OPTIONS);
  });

  it('should return logger error notification about missing certificate file', async () => {
    const nonExistentCertExpectedOptions = {
      ...EXPECTED_OPTIONS,
      ca: '',
    };
    await mockModules({ certPath: NON_EXISTENT_CERT });

    const { tlsAgent } = nonTLSCertificateManager.getTLSOptions();
    td.verify(
      loggerErrorMock(`${SERVICE_NAME} certificate does not exist at: ${NON_EXISTENT_CERT}`),
      { times: 1 },
    );
    expect(tlsAgent.options).to.deep.include(nonExistentCertExpectedOptions);
  });
});
