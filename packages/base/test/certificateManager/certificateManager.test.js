import { expect } from 'chai';
import * as td from 'testdouble';
import path from 'path';
import * as fs from 'fs';

const simpleFileHelperMock = {
  watchFile: () => true,
  stopFileWatch: () => [],
};

const getDependenciesConfig = ({
  tlsEnabled = true,
  sendClientCert = true,
  verifyServerCert = true,
}) => ({
  logtransformer: {
    enabled: tlsEnabled,
    host: 'eric-log-transformer',
    port: 5015,
    syslogFacility: 'local0',
    syslogAppName: 'eric-adp-gui-aggregator-service',
    tls: {
      sendClientCert,
      verifyServerCert,
    },
  },
});

const logtransformerCertDir = 'logtransformer';
const CA = 'ca';
const CERT = 'cert';
const KEY = 'key';
const SER_CERT = 'server_cert';
const SER_KEY = 'server_key';
const CERTIFICATES_DIR = 'certificates';
const SERVER_CERT_DIR = 'httpServer';
const HTTP_CA = 'httpCa';
const PM_CA = 'pm';
const CA_FILE = 'ser_ca.pem';
const SER_CA = 'ser_ca';
const HTTP_CA_PATH = path.join(CERTIFICATES_DIR, HTTP_CA, CA_FILE);
const PM_CA_PATH = path.join(CERTIFICATES_DIR, PM_CA, CA_FILE);
const MIN_VERSION = 'TLSv1.2';

let readFilePaths = [];

const resetReadFilePaths = () => {
  readFilePaths = [];
};

const loggerMock = {
  error: () => true,
  info: () => true,
  debug: () => true,
};

const fsMock = () => ({
  readFileSync: (filePath) => {
    readFilePaths.push(filePath);
    switch (filePath) {
      case path.join(CERTIFICATES_DIR, 'root', 'cacertbundle.pem'):
        return CA;
      case path.join(CERTIFICATES_DIR, logtransformerCertDir, 'cert.pem'):
        return CERT;
      case path.join(CERTIFICATES_DIR, logtransformerCertDir, 'key.pem'):
        return KEY;
      case path.join(CERTIFICATES_DIR, SERVER_CERT_DIR, 'key.pem'):
        return SER_KEY;
      case path.join(CERTIFICATES_DIR, SERVER_CERT_DIR, 'cert.pem'):
        return SER_CERT;
      case HTTP_CA_PATH:
        return SER_CA;
      case PM_CA_PATH:
        return SER_CA;
      default:
        return fs.readFileSync(filePath).toString();
    }
  },
  existsSync(filePath) {
    const certPaths = [
      path.join(CERTIFICATES_DIR, HTTP_CA),
      path.join(CERTIFICATES_DIR, PM_CA),
      HTTP_CA_PATH,
      PM_CA_PATH,
    ];
    return certPaths.some((certPath) => certPath === filePath);
  },
  readdirSync() {
    return [CA_FILE];
  },
});

const tlsMock = () => ({
  createSecureContext: (args) => args,
});

describe('Unit tests for certificateManager.js', () => {
  let certificateManager;

  const mockModules = async ({
    fileHelperMock = simpleFileHelperMock,
    logTransformerTlsEnabled = true,
    sendClientCert = true,
    verifyServerCert,
    tlsEnabled = true,
    verifyClientCertSer = true,
    setServerConfig = false,
  }) => {
    await td.replaceEsm('fs', fsMock());
    await td.replaceEsm('tls', tlsMock());
    await td.replaceEsm('../../src/utils/fileHelper.js', fileHelperMock);
    const dependenciesConfig = getDependenciesConfig({
      tlsEnabled: logTransformerTlsEnabled,
      sendClientCert,
      verifyServerCert,
    });
    const { CertificateManager } = await import('../../src/index.js');
    certificateManager = new CertificateManager({
      tlsEnabled,
      dependenciesConfig,
      certificatePath: CERTIFICATES_DIR,
      certificateWatchDebounceTime: 0,
      certificateConfig: {
        ca: 'cacertbundle.pem',
        key: 'key.pem',
        cert: 'cert.pem',
      },
      serverCertificateConfig: setServerConfig
        ? {
            certDir: SERVER_CERT_DIR,
            caCertDirs: [HTTP_CA, PM_CA],
            key: 'key.pem',
            cert: 'cert.pem',
            verifyClientCert: verifyClientCertSer,
          }
        : null,
      logger: loggerMock,
    });
    td.reset();
  };

  it('should not read and watch certificates when https disabled globally', async () => {
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      logTransformerTlsEnabled: true,
      tlsEnabled: false,
      setServerConfig: true,
    });

    expect(readFilePaths).to.have.lengthOf(0);
    expect(watchedFiles).to.have.lengthOf(0);

    const tlsOptions = certificateManager.getTLSOptions('logtransformer');

    resetReadFilePaths();
    expect(tlsOptions).to.be.null;
    expect(readFilePaths).to.have.lengthOf(0);
    expect(watchedFiles).to.have.lengthOf(0);

    const httpsOptions = certificateManager.getServerHttpsOpts();
    expect(httpsOptions).to.be.null;
  });

  it('should not read and watch certificates when disabled for a service', async () => {
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      logTransformerTlsEnabled: false,
    });
    const tlsOptions = certificateManager.getTLSOptions('logtransformer');

    resetReadFilePaths();
    expect(tlsOptions).to.be.null;
    expect(readFilePaths).to.have.lengthOf(0);
    expect(watchedFiles).to.have.lengthOf(0);
  });

  it('should read all related certificates when tls enabled for a service', async () => {
    await mockModules({ logTransformerTlsEnabled: true, sendClientCert: true });

    const tlsOptions = certificateManager.getTLSOptions('logtransformer');

    expect(tlsOptions).to.be.not.null;
    const { ca, key, cert } = tlsOptions.secureContext;
    expect(ca).to.be.eq(CA);
    expect(key).to.be.eq(KEY);
    expect(cert).to.be.eq(CERT);
  });

  it('should not read the client certificates when tls enabled but "sendClientCertificate" disabled for a service', async () => {
    await mockModules({ logTransformerTlsEnabled: true, sendClientCert: false });

    const tlsOptions = certificateManager.getTLSOptions('logtransformer');

    expect(tlsOptions).to.be.not.null;
    const { ca, key, cert } = tlsOptions.secureContext;
    expect(ca).to.be.eq(CA);
    expect(key).to.be.eq(undefined);
    expect(cert).to.be.eq(undefined);
  });

  it('should not read the CA certificate when tls enabled but "verifyServerCert" is disabled for a service', async () => {
    await mockModules({
      logTransformerTlsEnabled: true,
      sendClientCert: false,
      verifyServerCert: false,
    });

    const tlsOptions = certificateManager.getTLSOptions('logtransformer');

    expect(tlsOptions).to.be.not.null;
    const { ca, key, cert } = tlsOptions.secureContext;
    expect(ca).to.be.eq(undefined);
    expect(key).to.be.eq(undefined);
    expect(cert).to.be.eq(undefined);
  });

  it('should watch certificates when tls enabled for a service', async () => {
    const logtransformerCertRoot = path.join(CERTIFICATES_DIR, 'logtransformer');
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      logTransformerTlsEnabled: true,
    });

    expect(watchedFiles).to.include(logtransformerCertRoot);
  });

  it('should generate the proper config for a https agent', async () => {
    await mockModules({ logTransformerTlsEnabled: true, verifyServerCert: true });

    const { tlsAgent } = certificateManager.getTLSOptions('logtransformer');

    expect(tlsAgent).to.be.not.null;
    expect(tlsAgent.keepAlive).to.be.true;
    expect(tlsAgent.options.rejectUnauthorized).to.be.true;
    expect(tlsAgent.protocol).to.be.eq('https:');
  });

  it('should emit an "certificates-changed" event when a certificate has been changed', async () => {
    const servicesConfig = getDependenciesConfig({ tlsEnabled: true });
    const serviceNames = Object.keys(servicesConfig);
    const expectedEvent = 'certificates-changed';
    const watchCallbacks = {};

    const fileHelperMockWatch = {
      watchFile: (filePath, cb) => {
        watchCallbacks[filePath] = cb;
      },
      stopFileWatch: () => true,
    };
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      logTransformerTlsEnabled: true,
    });
    const fakeCallback = td.func();
    certificateManager.on(expectedEvent, fakeCallback);

    await Promise.all(
      serviceNames.map(async (serviceName) => {
        watchCallbacks[path.join(CERTIFICATES_DIR, serviceName)]();
        await new Promise((resolve) => {
          setTimeout(() => {
            td.verify(fakeCallback(serviceName), { times: 1 });
            resolve();
          }, 0);
        });
      }),
    );
  });
  it('should read all related server certificates', async () => {
    await mockModules({ setServerConfig: true });

    const httpsOptions = certificateManager.getServerHttpsOpts();

    expect(httpsOptions).to.be.not.null;
    const { ca, key, cert, requestCert, minVersion } = httpsOptions;
    expect(Array.isArray(ca)).to.be.true;
    expect(ca).to.have.lengthOf(2);
    ca.forEach((caFile) => {
      expect(caFile).to.be.eq(SER_CA);
    });
    expect(key).to.be.eq(SER_KEY);
    expect(cert).to.be.eq(SER_CERT);
    expect(requestCert).to.be.true;
    expect(minVersion).to.be.eq(MIN_VERSION);
  });

  it('should read and watch server certificates correctly', async () => {
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };
    resetReadFilePaths();
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      setServerConfig: true,
      logTransformerTlsEnabled: false,
    });

    const httpsOpts = certificateManager.getServerHttpsOpts();

    expect(httpsOpts).to.not.be.null;
    expect(readFilePaths).to.have.lengthOf(4);
    resetReadFilePaths();
    expect(watchedFiles).to.have.lengthOf(3);
  });

  it('should read and watch server certificates without "verifyClientCert" correctly', async () => {
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };
    resetReadFilePaths();
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      setServerConfig: true,
      logTransformerTlsEnabled: false,
      verifyClientCertSer: false,
    });

    const httpsOpts = certificateManager.getServerHttpsOpts();

    expect(httpsOpts).to.not.be.null;
    expect(readFilePaths).to.have.lengthOf(2);
    resetReadFilePaths();
    expect(watchedFiles).to.have.lengthOf(1);
  });

  it('should emit an "server-certificates-changed" event when a certificate has been changed', async () => {
    const expectedEvent = 'server-certificates-changed';
    const watchCallbacks = {};
    const dirNames = [SERVER_CERT_DIR, HTTP_CA, PM_CA];

    const fileHelperMockWatch = {
      watchFile: (filePath, cb) => {
        watchCallbacks[filePath] = cb;
      },
      stopFileWatch: () => [],
    };
    await mockModules({
      fileHelperMock: fileHelperMockWatch,
      setServerConfig: true,
      logTransformerTlsEnabled: false,
    });

    const fakeCallback = td.func();
    certificateManager.on(expectedEvent, fakeCallback);

    await Promise.all(
      dirNames.map(async (dirName) => {
        watchCallbacks[path.join(CERTIFICATES_DIR, dirName)]();
        await new Promise((resolve) => {
          setTimeout(() => {
            td.verify(fakeCallback(SERVER_CERT_DIR), { times: 1 });
            resolve();
          }, 0);
        });
      }),
    );
  });
});
