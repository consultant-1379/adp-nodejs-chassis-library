import { expect } from 'chai';
import { createRequire } from 'module';
import * as td from 'testdouble';

const require = createRequire(import.meta.url);
const defaultContainerConfig = require('./mocks/container-config-default.json');
const containerConfig = require('./mocks/container-config.json');
const additionalConfig = require('./mocks/additional-config.json');
const simpleConfig = require('./mocks/simple-config.json');
const simpleMainConfig = require('./mocks/simple-main-config.json');
const simpleSchema = require('./mocks/simple-config-schema.json');
const simpleMainSchema = require('./mocks/simple-main-config-schema.json');
const defaultArrayConfig = require('./mocks/default-array-config.json');
const arrayConfig = require('./mocks/array-config.json');

const plainText = 'hello';

const configName = 'containerConfig';
const additionalConfigName = 'additionalConfig';
const CONFIG_FILES = {
  container: 'mocks/container-config.json',
  additional: 'mocks/additional-config.json',
  simple: 'mocks/simple-config.json',
  simpleMain: 'mocks/simple-main-config.json',
  invalid: 'invalid-config.json',
  array: 'mocks/array-config.json',
  plainText: 'mocks/plain-text-config.txt',
  missingPlainTextFile: 'mocks/missing-plain-text-config.txt',
};
const expectedContainerConfig = {
  useHttps: true,
  appName: 'Dummy app',
  label: 'default',
  logger: {
    settings: {
      enabled: true,
    },
  },
};

const expectedArrayConfig = [
  {
    useHttps: true,
    appName: 'Dummy app',
    logger: {
      settings: {
        enabled: true,
      },
    },
  },
];

const loggerMock = {
  error: () => true,
  info: () => true,
  debug: () => true,
};

const simpleFileHelperMock = {
  watchFile: () => true,
  stopFileWatch: () => [],
};

const FILE_NOT_FOUND_ERROR = 'File was not found';

const fsMock = () => ({
  readFileSync: (filePath) => {
    switch (filePath) {
      case CONFIG_FILES.container:
        return JSON.stringify(containerConfig);
      case CONFIG_FILES.additional:
        return JSON.stringify(additionalConfig);
      case CONFIG_FILES.simple:
        return JSON.stringify(simpleConfig);
      case CONFIG_FILES.simpleMain:
        return JSON.stringify(simpleMainConfig);
      case CONFIG_FILES.array:
        return JSON.stringify(arrayConfig);
      case CONFIG_FILES.emptyArray:
        return [];
      case CONFIG_FILES.plainText:
        return plainText;
      case CONFIG_FILES.invalid:
        return `{"useHttps":true`;
      case CONFIG_FILES.missingPlainTextFile:
        throw new Error(FILE_NOT_FOUND_ERROR);
      default:
        return '';
    }
  },
  // This method required by NonTLSCertificateManager.js
  existsSync: () => true,
});

describe('Unit tests for configManager.js', () => {
  let configManager;
  let ConfigManager;

  const mockModules = async (fileHelperMock, configManagerParams, logger = loggerMock) => {
    await td.replaceEsm('fs', fsMock());
    await td.replaceEsm('../../src/utils/fileHelper.js', fileHelperMock);
    ConfigManager = (await import('../../src/index.js')).ConfigManager;
    configManager = new ConfigManager(configManagerParams, logger);
    td.reset();
  };

  it('should successfully create empty ConfigManager instance', async () => {
    await mockModules(simpleFileHelperMock);

    expect(configManager).to.be.instanceof(ConfigManager);
    expect(configManager.configWatchMap.size).to.be.equal(0);
    expect(configManager.configMap.size).to.be.equal(0);
  });

  it('should successfully create config with default value', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        defaultValue: defaultContainerConfig,
      },
    ]);

    expect(configManager.get(configName)).to.be.deep.equal(defaultContainerConfig);
  });

  it('should deeply merge the runtime and the default configs', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        defaultValue: defaultContainerConfig,
        filePath: CONFIG_FILES.container,
      },
    ]);
    expect(configManager.get(configName)).to.be.deep.equal(expectedContainerConfig);
  });

  it('should validate config with simple schema', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        filePath: CONFIG_FILES.simple,
        schema: simpleSchema,
        fileType: ConfigManager.FILE_TYPES.JSON,
      },
    ]);

    expect(configManager.get(configName)).to.be.deep.equal(simpleConfig);
  });

  it('should validate config with compound schema', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        filePath: CONFIG_FILES.simpleMain,
        schema: simpleMainSchema,
        additionalSchemaList: [simpleSchema],
      },
    ]);

    expect(configManager.get(configName)).to.be.deep.equal(simpleMainConfig);
  });

  it('invocation of startConfigWatch() method with different file should throw an error', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        defaultValue: defaultContainerConfig,
        filePath: CONFIG_FILES.container,
      },
    ]);
    expect(
      configManager.startConfigWatch.bind(configManager, {
        name: configName,
        filePath: CONFIG_FILES.additional,
      }),
    ).to.throw(`Attempt to create a new config with existing name - ${configName}`);
  });

  it('should watch for changes in config files', async () => {
    const expectedWatchedFiles = [CONFIG_FILES.container, CONFIG_FILES.additional];
    const watchedFiles = [];
    const fileHelperMockWatch = {
      watchFile: (filePath) => {
        watchedFiles.push(filePath);
      },
      stopFileWatch: () => [],
    };

    await mockModules(fileHelperMockWatch, [
      { name: configName, filePath: CONFIG_FILES.container },
      { name: additionalConfigName, filePath: CONFIG_FILES.additional },
    ]);

    expectedWatchedFiles.forEach((expectedFile) => {
      expect(watchedFiles).to.include(expectedFile);
    });
  });

  it('should emit an event when container-config file has been changed', async () => {
    const expectedContainerEvent = 'config-changed';
    const expectedEmitArguments = {
      name: configName,
      filePath: CONFIG_FILES.container,
    };
    const watchCallbacks = {};
    const fileHelperMockWatch = {
      watchFile: (filePath, cb) => {
        watchCallbacks[filePath] = cb;
      },
      stopFileWatch: () => [],
    };
    const expectedEventCallback = td.func();

    await mockModules(fileHelperMockWatch, [
      { name: configName, filePath: CONFIG_FILES.container },
    ]);
    configManager.on(expectedContainerEvent, expectedEventCallback);

    watchCallbacks[CONFIG_FILES.container]();
    td.verify(expectedEventCallback(expectedEmitArguments), { times: 1 });
  });

  it('should log an error when config JSON has syntax error', async () => {
    const fakeLogger = td.object(['error', 'info', 'debug', 'warning']);
    await mockModules(simpleFileHelperMock, null, fakeLogger);

    configManager.startConfigWatch({
      name: configName,
      filePath: CONFIG_FILES.invalid,
    });
    td.verify(fakeLogger.error(td.matchers.anything()), { times: 1 });
  });

  it('stopAllConfigWatch method should work properly', async () => {
    const removeAllListenersMock = td.func();
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        defaultValue: defaultContainerConfig,
        filePath: CONFIG_FILES.container,
      },
    ]);
    expect(configManager.configWatchMap.size).to.be.equal(1);

    td.replace(configManager, 'removeAllListeners', removeAllListenersMock);
    configManager.stopAllConfigWatch();
    expect(configManager.configWatchMap.size).to.be.equal(0);
    td.verify(removeAllListenersMock(), { times: 1 });
  });

  it('can handle plain text configs', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        filePath: CONFIG_FILES.plainText,
        fileType: ConfigManager.FILE_TYPES.TEXT,
      },
    ]);
    expect(configManager.get(configName)).to.be.equal(plainText);
  });

  it('will throw error for the unsupported config format', async () => {
    try {
      await mockModules(simpleFileHelperMock, [
        {
          name: configName,
          filePath: CONFIG_FILES.container,
          fileType: 'gif',
        },
      ]);
    } catch (error) {
      expect(error.message).to.equal('Unsupported type gif');
      return;
    }
    expect.fail('Should have thrown error');
  });

  it('can handle array configs', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        filePath: CONFIG_FILES.array,
      },
    ]);
    console.log(configManager.get(configName));
    expect(configManager.get(configName)).to.be.deep.equal(expectedArrayConfig);
  });

  it('can handle plain text configs with missing files', async () => {
    const fakeLogger = td.object(['error', 'info', 'debug', 'warning']);
    await mockModules(simpleFileHelperMock, null, fakeLogger);
    configManager.startConfigWatch({
      name: configName,
      filePath: CONFIG_FILES.missingPlainTextFile,
      fileType: ConfigManager.FILE_TYPES.TEXT,
    });
    console.log(configManager.get(configName));
    expect(configManager.get(configName)).to.be.equal('');
    td.verify(
      fakeLogger.error(
        td.matchers.contains(
          `Error occurred reading mocks/missing-plain-text-config.txt config file: ${FILE_NOT_FOUND_ERROR}`,
        ),
      ),
      { times: 1 },
    );
  });

  it('can handle array configs with empty config', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        defaultValue: defaultArrayConfig,
        filePath: CONFIG_FILES.emptyArray,
      },
    ]);

    expect(configManager.get(configName)).to.be.deep.equal(defaultArrayConfig);
  });

  it('returns empty object for empty configs', async () => {
    await mockModules(simpleFileHelperMock, [
      {
        name: configName,
        filePath: CONFIG_FILES.emptyArray,
      },
    ]);

    expect(configManager.get(configName)).to.be.deep.equal({});
  });
});
