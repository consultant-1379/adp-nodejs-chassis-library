import { expect } from 'chai';
import supertest from 'supertest';
import * as td from 'testdouble';
import { createRequire } from 'module';
import { UIConfigService } from '../../src/index.js';

const require = createRequire(import.meta.url);
const containerConfig = require('./mocks/container-config.json');

const simpleFileHelperMock = {
  watchFile: () => true,
  stopFileWatch: () => [],
};

const loggerMock = {
  error: () => true,
  info: () => true,
  debug: () => true,
};

const CONFIG_FILE = 'mocks/container-config.json';

const MISSING_FILE = 'someOtherFile.json';

const CONFIG_OBJECT = {
  routes: {
    route1: '/route/1',
    route2: '/route/2',
  },
};

const fsCommonMock = () => ({
  readFileSync: (filePath) => {
    if (filePath === CONFIG_FILE) {
      return JSON.stringify(containerConfig);
    }
    return '';
  },
  // This method required by NonTLSCertificateManager.js
  existsSync: () => true,
});

describe('Unit tests for uiConfigService.js', () => {
  let configManager;
  let ConfigManager;

  const getConfigManager = async (fileHelperMock, fsMock = fsCommonMock) => {
    td.replaceEsm('../../src/utils/fileHelper.js', fileHelperMock);
    td.replaceEsm('fs', fsMock());
    ConfigManager = (await import('../../src/index.js')).ConfigManager;
    configManager = new ConfigManager([], loggerMock);
    td.reset();
    return configManager;
  };

  it('should be defined', () => {
    expect(UIConfigService).not.to.be.undefined;
  });

  it('must throw an exception if configManager is not provided', () => {
    try {
      const uiConfig = new UIConfigService({ configFilePath: 'test' });
      uiConfig.getUIConfig();
    } catch (error) {
      expect(error.message).to.equal('Config manager must be provided');
    }
  });

  describe('Testing uiConfigService functionality', () => {
    afterEach(() => {
      if (configManager) {
        configManager.stopAllConfigWatch();
      }
    });

    it('can be instantiated with configManager and default values are overwritten', async () => {
      const mockedConfigManager = await getConfigManager(simpleFileHelperMock);
      const uiConfig = new UIConfigService({
        configFilePath: CONFIG_FILE,
        configManager: mockedConfigManager,
        defaultValue: { useHttps: false },
        configObject: CONFIG_OBJECT,
      });
      expect(uiConfig).not.to.be.undefined;
      expect(uiConfig.getUIConfig()).to.be.eql({
        ...CONFIG_OBJECT,
        ...containerConfig,
      });
    });

    it('is instantiated with default values if config file is absent', async () => {
      const mockedConfigManager = await getConfigManager(simpleFileHelperMock);
      const uiConfig = new UIConfigService({
        configFilePath: MISSING_FILE,
        configManager: mockedConfigManager,
        defaultValue: containerConfig,
        configObject: CONFIG_OBJECT,
      });
      expect(uiConfig).not.to.be.undefined;
      expect(uiConfig.getUIConfig()).to.be.eql({
        ...CONFIG_OBJECT,
        ...containerConfig,
      });
    });

    it('UiConfigService can be updated manually', async () => {
      const mockedConfigManager = await getConfigManager(simpleFileHelperMock);
      const configToUpdate = { ...CONFIG_OBJECT };
      const finalConfig = {
        routes: {
          route1: '/route/1',
          route2: '/route/2',
          route3: '/route/3',
        },
      };
      const uiConfig = new UIConfigService({
        configFilePath: CONFIG_FILE,
        configManager: mockedConfigManager,
        configObject: configToUpdate,
      });
      expect(uiConfig).not.to.be.undefined;
      expect(uiConfig.getUIConfig()).to.be.eql({ ...CONFIG_OBJECT, ...containerConfig });
      configToUpdate.routes.route3 = '/route/3';
      uiConfig.updateUIConfig();
      expect(uiConfig.getUIConfig()).to.be.eql({ ...finalConfig, ...containerConfig });
    });

    it('UiConfigService is automatically updated', async () => {
      const configToUpdate = { ...CONFIG_OBJECT };
      const watchCallbacks = {};
      const fileHelperMockWatch = {
        watchFile: (filePath, cb) => {
          watchCallbacks[filePath] = cb;
        },
        stopFileWatch: () => [],
      };
      let currentFileContent = {};
      const fsMock = () => ({
        readFileSync: (filePath) => {
          if (filePath === CONFIG_FILE) {
            return JSON.stringify(currentFileContent);
          }
          return '';
        },
        existsSync: () => true,
      });
      const mockedConfigManager = await getConfigManager(fileHelperMockWatch, fsMock);
      const uiConfig = new UIConfigService({
        configFilePath: CONFIG_FILE,
        configManager: mockedConfigManager,
        configObject: configToUpdate,
      });
      expect(uiConfig).not.to.be.undefined;
      expect(uiConfig.getUIConfig()).to.be.eql({ ...CONFIG_OBJECT });
      currentFileContent = containerConfig;
      uiConfig.on('ui-config-changed', () => {
        expect(uiConfig.getUIConfig()).to.be.eql({ ...CONFIG_OBJECT, ...containerConfig });
      });
      watchCallbacks[CONFIG_FILE]();
    });

    describe('express related functionality check', () => {
      let request;
      let server;
      let app;
      const PARAMS = {
        nodeFetch: 'node-fetch',
        ContentType: 'Content-Type',
      };
      const responseCheck = (response, expectedContent) => {
        const content = response.body;
        expect(content).to.deep.eq(expectedContent);
      };
      before(async () => {
        const express = (await import('express')).default;
        app = express();
        server = app.listen();
        request = supertest.agent(server);
      });
      after((done) => {
        server.close(done);
      });

      it('UiConfigService getUIConfigMiddleware works', async () => {
        const mockedConfigManager = await getConfigManager(simpleFileHelperMock);
        const UICONFIG_URL = '/uiConfig';
        const uiConfig = new UIConfigService({
          configFilePath: CONFIG_FILE,
          configManager: mockedConfigManager,
          configObject: CONFIG_OBJECT,
        });
        expect(uiConfig).not.to.be.undefined;
        app.get(UICONFIG_URL, uiConfig.getUIConfigMiddleware());
        await request
          .get(UICONFIG_URL)
          .expect(PARAMS.ContentType, /application\/json/)
          .expect((response) => {
            responseCheck(response, { ...CONFIG_OBJECT, ...containerConfig });
          });
      });
    });
  });
});
