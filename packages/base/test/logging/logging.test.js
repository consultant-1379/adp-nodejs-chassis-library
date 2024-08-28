import { assert, expect } from 'chai';
import * as td from 'testdouble';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync, readFileSync } from 'fs';
import { logger as logging } from '../../src/index.js';
import CONSTANTS from '../../src/logging/constants.js';
import Console from '../../src/logging/Console.js';

const { configureLogger, getLogger } = logging;
const { LOG_LEVELS } = CONSTANTS;
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_LOG_DIR = `${__dirname}/testLogs`;
const CATEGORY = 'main';

const baseLoggingConfig = {
  serviceName: 'MochaTest',
  defaultLogLevel: 'info',

  stdout: {
    enabled: true,
  },
  filelog: {
    enabled: true,
    logDirName: TEST_LOG_DIR,
    logFileName: 'MochaTest',
    maxSize: 1024,
    maxFiles: 1,
  },
  syslog: {
    enabled: false,
    syslogHost: 'localhost',
    syslogFacility: 'local0',
  },
  jsonTCPLog: {
    enabled: false,
    host: 'localhost',
    facility: 'local1',
  },
};

function logDirClear() {
  rmSync(TEST_LOG_DIR, { recursive: true, force: true });
}

describe('Unit tests for logging.js', () => {
  const transportTypes = ['console', 'file', 'syslog', 'jsonTCP'];
  const logTransformerTransportTypes = ['syslog', 'jsonTCP'];

  const testErrorEvents = (transportType) =>
    it(`should emit an event when '${transportType}' transport emit an "error" event`, () => {
      const EXPECTED_LOGGER_EVENT = `${transportType.toLowerCase()}-error`;
      const EXPECTED_ERROR = new Error(`Error on ${transportType} transport.`);
      const loggingConfig = {
        ...baseLoggingConfig,
        syslog: { enabled: transportType === 'syslog' },
        stdout: { enabled: transportType === 'console' },
        filelog: { enabled: transportType === 'file' },
        jsonTCPLog: { enabled: transportType === 'jsonTCP' },
      };
      const expectedEventCallback = td.func();

      logging.on(EXPECTED_LOGGER_EVENT, expectedEventCallback);
      configureLogger(loggingConfig);

      const logger = getLogger();
      const transport = logger.transports[0];
      transport.emit('error', EXPECTED_ERROR);
      td.verify(expectedEventCallback(EXPECTED_ERROR), { times: 1 });
    });

  const testEnablingSingleTransport = (transportType) => {
    it(`only '${transportType}' transport is added when it's the only one enabled`, () => {
      const loggingConfig = {
        ...baseLoggingConfig,
        syslog: { enabled: transportType === 'syslog' },
        stdout: { enabled: transportType === 'console' },
        filelog: { enabled: transportType === 'file' },
        jsonTCPLog: { enabled: transportType === 'jsonTCP' },
      };
      const winstonConfig = logging._getWinstonConfig(loggingConfig);

      expect(winstonConfig.transports.some((transport) => transport.name === transportType)).to.be
        .true;

      transportTypes
        .filter((type) => type !== transportType)
        .forEach((type) => {
          expect(winstonConfig.transports.some((transport) => transport.name === type)).to.be.false;
        });
    });
  };

  after(() => {
    logDirClear();
  });

  it('logLevels should be exported properly', () => {
    const logLevels = logging.LOG_LEVELS;

    expect(logLevels).to.deep.equal(LOG_LEVELS);
  });

  it('should add proper log levels for each log transport', () => {
    const loggingConfig = {
      ...baseLoggingConfig,
      defaultLogLevel: 'debug',
    };
    const winstonConfig = logging._getWinstonConfig(loggingConfig);

    Object.values(winstonConfig.transports).forEach((transport) => {
      expect(transport.level).to.eq(loggingConfig.defaultLogLevel);
    });
  });

  it('should transport option skipped when a log transports are not enabled', () => {
    const loggingConfig = {
      ...baseLoggingConfig,
      stdout: { enabled: false },
      filelog: { enabled: false },
    };
    const winstonConfig = logging._getWinstonConfig(loggingConfig);

    expect(winstonConfig.transports.length).to.eq(0);
  });

  it('all transports are added when they enabled by config', () => {
    const loggingConfig = {
      ...baseLoggingConfig,
      syslog: { enabled: true },
      jsonTCPLog: { enabled: true },
    };
    const winstonConfig = logging._getWinstonConfig(loggingConfig);

    expect(winstonConfig.transports.some((transport) => transport.name === 'console')).to.be.true;
    expect(winstonConfig.transports.some((transport) => transport.name === 'file')).to.be.true;
    expect(winstonConfig.transports.some((transport) => transport.name === 'syslog')).to.be.true;
    expect(winstonConfig.transports.some((transport) => transport.name === 'jsonTCP')).to.be.true;
  });

  transportTypes.forEach(testEnablingSingleTransport);

  it('create custom console transporter when stdout json format is enabled', () => {
    const loggingConfig = {
      ...baseLoggingConfig,
      stdout: { format: 'json' },
    };
    const winstonConfig = logging._getWinstonConfig(loggingConfig);

    const consoleTransport = winstonConfig.transports.find(
      (transport) => transport.name === 'Console',
    );
    assert.instanceOf(consoleTransport, Console);
  });

  it('should log to the file', async () => {
    // if fails, check 'silent' option not to be set in transport options for file transport
    configureLogger(baseLoggingConfig);
    const logger = getLogger();
    const testMessage = 'Mocha test message';
    const delayTime = 500;

    logger.info(testMessage);
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log(`delaying for ${delayTime} ms`);
        resolve(true);
      }, delayTime);
    });

    const logDir = `${TEST_LOG_DIR}/${baseLoggingConfig.filelog.logFileName}.log`;
    const logFile = readFileSync(logDir);
    const log = JSON.parse(logFile.toString());
    expect(log.message).to.eq(testMessage);
  });

  it('add file transport to log transports when audit logging was selected', () => {
    const loggingConfig = baseLoggingConfig;
    const winstonConfig = logging._getWinstonConfig(loggingConfig, 'audit');

    //  later the audit transport could be a file --> transport.name === 'file'
    expect(winstonConfig.transports.some((transport) => transport.name === 'console')).to.be.true;
  });

  logTransformerTransportTypes.forEach((transportType) => {
    it(`should set protocol for ${transportType} transport according to tls settings`, () => {
      const getProtocol = (winstonConfig) => {
        const { transports } = winstonConfig;
        const transportOptions = transports.find((transport) => transport.name === transportType);
        return transportOptions.protocol;
      };
      const loggingConfig = {
        ...baseLoggingConfig,
        syslog: {
          enabled: transportType === 'syslog',
          tls: {
            enabled: true,
          },
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          tls: {
            enabled: true,
          },
        },
      };

      const tlsEnabledProtocol = getProtocol(logging._getWinstonConfig(loggingConfig));
      expect(tlsEnabledProtocol).to.eq('tls4');

      const loggingConfig2 = {
        ...baseLoggingConfig,
        syslog: {
          enabled: transportType === 'syslog',
          tls: {
            enabled: false,
          },
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          tls: {
            enabled: false,
          },
        },
      };
      const tlsDisabledSyslogProtocol = getProtocol(logging._getWinstonConfig(loggingConfig2));
      expect(tlsDisabledSyslogProtocol).to.eq('tcp4');
    });

    it(`${transportType} transport should use a specific category facility according to the config`, () => {
      const CATEGORY_FACILITY = 'local1';
      const DEFAULT_FACILITY = 'local2';
      const loggingConfig = {
        ...baseLoggingConfig,
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
          syslogFacility: DEFAULT_FACILITY,
          facilityCategories: {
            [CATEGORY]: CATEGORY_FACILITY,
          },
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          facility: DEFAULT_FACILITY,
          facilityCategories: {
            [CATEGORY]: CATEGORY_FACILITY,
          },
        },
      };

      const winstonConfig = logging._getWinstonConfig(loggingConfig, CATEGORY);
      expect(winstonConfig.transports[0].name).to.be.eq(transportType);
      expect(winstonConfig.transports[0].facility).to.be.eq(CATEGORY_FACILITY);
    });

    it(`${transportType} transport should use default facility if category's facility isn't set`, () => {
      const DEFAULT_FACILITY = 'local2';
      const loggingConfig = {
        ...baseLoggingConfig,
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: { enabled: transportType === 'syslog', syslogFacility: DEFAULT_FACILITY },
        jsonTCPLog: { enabled: transportType === 'jsonTCP', facility: DEFAULT_FACILITY },
      };

      const winstonConfig1 = logging._getWinstonConfig(loggingConfig, CATEGORY);
      expect(winstonConfig1.transports[0].name).to.be.eq(transportType);
      expect(winstonConfig1.transports[0].facility).to.be.eq(DEFAULT_FACILITY);

      const winstonConfig2 = logging._getWinstonConfig(
        { ...loggingConfig, facilityCategories: {} },
        CATEGORY,
      );
      expect(winstonConfig2.transports[0].name).to.be.eq(transportType);
      expect(winstonConfig2.transports[0].facility).to.be.eq(DEFAULT_FACILITY);
    });

    it(`${transportType} transport should use default facility if facility it set incorrectly`, () => {
      const DEFAULT_FACILITY = 'local0';
      const WRONG_FACILITY = 'info';
      const loggingConfig = {
        ...baseLoggingConfig,
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
          syslogFacility: undefined,
          facilityCategories: {
            [CATEGORY]: WRONG_FACILITY,
          },
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          facility: undefined,
          facilityCategories: {
            [CATEGORY]: WRONG_FACILITY,
          },
        },
      };

      const winstonConfig1 = logging._getWinstonConfig(loggingConfig, CATEGORY);
      expect(winstonConfig1.transports[0].facility).to.be.eq(DEFAULT_FACILITY);

      const winstonConfig2 = logging._getWinstonConfig({
        ...loggingConfig,
        syslog: { enabled: transportType === 'syslog', syslogFacility: WRONG_FACILITY },
        jsonTCPLog: { enabled: transportType === 'jsonTCP', facility: WRONG_FACILITY },
      });
      expect(winstonConfig2.transports[0].facility).to.be.eq(DEFAULT_FACILITY);
    });

    it(`${transportType} transport will use a proper default port and protocol based on tls.enabled option`, () => {
      const expectedTLSDisabledParts = {
        syslog: {
          port: 5014,
          protocol: 'tcp4',
        },
        jsonTCP: {
          port: 5025,
          protocol: 'tcp4',
        },
      };
      const expectedTLSEnabledParts = {
        syslog: {
          port: 5015,
          protocol: 'tls4',
        },
        jsonTCP: {
          port: 5024,
          protocol: 'tls4',
        },
      };
      const loggingConfigTLSDisabled = {
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
        },
      };
      const loggingConfigTLSEnabled = {
        ...baseLoggingConfig,
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
          tls: { enabled: true },
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          tls: { enabled: true },
        },
      };

      const winstonConfigTLSDisabled = logging._getWinstonConfig(loggingConfigTLSDisabled);
      expect(winstonConfigTLSDisabled.transports[0].port).to.be.eq(
        expectedTLSDisabledParts[transportType].port,
      );
      expect(winstonConfigTLSDisabled.transports[0].protocol).to.be.eq(
        expectedTLSDisabledParts[transportType].protocol,
      );

      const winstonConfigTLSEnabled = logging._getWinstonConfig(loggingConfigTLSEnabled);
      expect(winstonConfigTLSEnabled.transports[0].port).to.be.eq(
        expectedTLSEnabledParts[transportType].port,
      );
      expect(winstonConfigTLSEnabled.transports[0].protocol).to.be.eq(
        expectedTLSEnabledParts[transportType].protocol,
      );
    });

    it(`${transportType} transport will use specified port`, () => {
      const expectedTLSDisabledPorts = {
        syslog: {
          port: 5151,
        },
        jsonTCP: {
          port: 5252,
        },
      };
      const expectedTLSEnabledPorts = {
        syslog: {
          port: 5155,
        },
        jsonTCP: {
          port: 5255,
        },
      };
      const loggingConfigTLSDisabled = {
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
          tls: { enabled: false },
          port: 5151,
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          tls: { enabled: false },
          port: 5252,
        },
      };
      const loggingConfigTLSEnabled = {
        ...baseLoggingConfig,
        filelog: { enabled: false },
        stdout: { enabled: false },
        syslog: {
          enabled: transportType === 'syslog',
          tls: { enabled: true },
          port: 5155,
        },
        jsonTCPLog: {
          enabled: transportType === 'jsonTCP',
          tls: { enabled: true },
          port: 5255,
        },
      };

      const winstonConfigTLSDisabled = logging._getWinstonConfig(loggingConfigTLSDisabled);
      expect(winstonConfigTLSDisabled.transports[0].port).to.be.eq(
        expectedTLSDisabledPorts[transportType].port,
      );

      const winstonConfigTLSEnabled = logging._getWinstonConfig(loggingConfigTLSEnabled);
      expect(winstonConfigTLSEnabled.transports[0].port).to.be.eq(
        expectedTLSEnabledPorts[transportType].port,
      );
    });
  });

  transportTypes.forEach(testErrorEvents);
});
