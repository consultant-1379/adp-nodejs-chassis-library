import winston from 'winston';
import { EventEmitter } from 'events';
import { mergeObj } from './utils.js';
import CONSTANTS from './constants.js';
import Console from './Console.js';
import Syslog from './Syslog.js';
import JsonTCP from './JsonTCP.js';

const { format, loggers, transports } = winston;
const { printf } = format;
const { LOG_LEVELS, DEFAULT_LOG, LOG_COLORS, FACILITIES } = CONSTANTS;
let logConfig = DEFAULT_LOG;
let self;

/**
 * Define log formats for Winston
 * @private
 *
 * @returns {string} The formatted log
 */
const consoleFormat = printf(
  // eslint-disable-next-line no-shadow
  ({ level, message, label, timestamp }) => `${timestamp} [${label}] [${level}] ${message}`,
);

/**
 * Define log formats for Syslog
 * @private
 *
 * @returns {string} The formatted log
 */
const syslogFormat = printf(
  ({ message, label }) => `[${label}] ${message.toString().replace(/(\r\n|\n|\r)/gm, '')}`,
);

/**
 * @typedef {object} FilelogConfig
 * @property {boolean} enabled - Turns on writing logs to a file.
 * @property {string} logFileName - Can be just a name or contains full path to the file.
 * @property {string} logDirName - Directory where the file should be written. Can
 * be omitted if logFileName contains the full path.
 * @property {number} maxSize - Maximum file size in bytes.
 * @property {number} maxFiles - Maximum number of files.
 */

/**
 * @typedef {object} SyslogConfig
 * @property {boolean} enabled - Turns on syslog logs.
 * @property {string} syslogHost - Host address of log server.
 * @property {string} syslogFacility - Default facility (=local0).
 * @property {object} [facilityCategories] - Facilities for certain categories,
 * where key is a category and value is a facility.
 * @property {object} tls - TLS configuration.
 * @property {boolean} tls.enabled - Turns on TLS.
 * @property {object} tls.protocolOptions - Additional protocol options.
 * @property {string} podName - Pod name.
 * @property {object} metadata - Additional metadata.
 */

/**
 * @typedef {object} JsonTCPLogConfig
 * @property {boolean} enabled - Turns on JSON-TCP logs.
 * @property {string} host - Host address of log server.
 * @property {string} facility - Default facility (=local0).
 * @property {object} [facilityCategories] - Facilities for certain categories,
 * where key is a category and value is a facility.
 * @property {number} [port] - Port to reach log server.
 * @property {string} [protocol] - Protocol to reach log server.
 * @property {object} tls - TLS configuration.
 * @property {boolean} tls.enabled - Turns on TLS.
 * @property {object} tls.protocolOptions - Additional protocol options.
 * @property {string} podName - Pod name.
 * @property {object} metadata - Additional metadata.
 * @property {string} [logSeparator] - Separator between log messages. For
 * Log Transformer it should be a new line `\n`.
 */

/**
 * @typedef {object} ConsoleLogConfig
 * @property {boolean} enabled - Turns on logs for console.
 * @property {string} facility - Default facility (=local0).
 * @property {object} [facilityCategories] - Facilities for certain categories,
 * where key is a category and value is a facility.
 * @property {string} podName - Pod name.
 * @property {object} metadata - Additional metadata.
 * @property {string} [logSeparator] - Separator between log messages. For
 * Log Transformer it should be a new line `\n`.
 */

/**
 * Contains methods to set up Winston transport according to the provided configuration. Supports
 * logging to the console, to the file, and to the remote syslog consumer.
 *
 * @extends EventEmitter
 * @fires Logger#syslog-error
 * @fires Logger#jsontcp-error
 */
class Logger extends EventEmitter {
  constructor() {
    super();
    self = this;
  }

  /**
   * Returns logging levels.
   *
   * @returns {object} Logging levels.
   */
  get LOG_LEVELS() {
    return LOG_LEVELS;
  }

  /**
   * Returns a Winston configuration object.
   * @private
   *
   * @param {object} [config] - The configuration.
   * @param {string} [category] - Logging category.
   * @returns {object} The Winston config object catch.
   */
  _getWinstonConfig(config = {}, category = CONSTANTS.DEFAULT_CATEGORY) {
    const { combine, label, timestamp, colorize, json } = format;
    const loggingConfig = mergeObj(DEFAULT_LOG, config);
    const {
      serviceName,

      stdout,
      filelog = {},
      syslog = {},
      jsonTCPLog = {},

      silent = process.env.NODE_ENV === 'test',
    } = loggingConfig;
    const logLevel = this.#getLogLevel(loggingConfig, category);
    const transportOptions = {
      console: {
        enabled: stdout.enabled,
        category,
        level: logLevel,
        facility: this.#getFacility(stdout, DEFAULT_LOG.stdout.facility, category),
        app_name: serviceName,
        metadata: stdout.metadata,
        podName: stdout.podName,
        stdoutFormat: stdout.format,
        format: combine(
          colorize({ colors: LOG_COLORS }),
          label({ label: category }),
          timestamp(),
          consoleFormat,
        ),
        silent,
      },
      file: {
        enabled: filelog.enabled,
        filename: `${filelog.logFileName}.log`,
        dirname: filelog.logDirName,
        maxsize: filelog.maxSize,
        maxFiles: filelog.maxFiles,
        tailable: true, // set false to disable log rotation
        level: logLevel,
        format: json(),
      },
      syslog: {
        enabled: syslog.enabled,
        category,
        level: logLevel,
        format: combine(label({ label: category }), syslogFormat),
        host: syslog.syslogHost,
        port: syslog.port || (syslog.tls?.enabled ? 5015 : 5014),
        facility: this.#getFacility(syslog, DEFAULT_LOG.syslog.syslogFacility, category),
        protocol: syslog.tls?.enabled ? 'tls4' : 'tcp4',
        protocolOptions: syslog.tls?.protocolOptions,
        type: CONSTANTS.SYSLOG_TYPE,
        app_name: serviceName,
        eol: '\n',
        silent,
      },
      jsonTCP: {
        enabled: jsonTCPLog.enabled,
        category,
        level: logLevel,
        host: jsonTCPLog.host,
        port: jsonTCPLog.port || (jsonTCPLog.tls?.enabled ? 5024 : 5025),
        tls: jsonTCPLog.tls?.enabled,
        facility: this.#getFacility(jsonTCPLog, DEFAULT_LOG.jsonTCPLog.facility, category),
        protocol: jsonTCPLog.tls?.enabled ? 'tls4' : 'tcp4',
        protocolOptions: jsonTCPLog.tls?.protocolOptions,
        app_name: serviceName,
        metadata: jsonTCPLog.metadata,
        podName: jsonTCPLog.podName,
        logSeparator: jsonTCPLog.logSeparator,
        silent,
      },
    };

    const logTransports = this.#createTransports(transportOptions);

    return {
      defaultMeta: {
        service: serviceName,
        meta: {
          msgID: category,
          host: syslog.podName || jsonTCPLog.podName,
          structuredData: {
            [CONSTANTS.METADATA_ID]: syslog.metadata || jsonTCPLog.metadata,
          },
        },
      },
      levels: LOG_LEVELS,
      transports: logTransports,
    };
  }

  /**
   * Instantiate winston transports based on provided configuration.
   *
   * @param {object} transportOptions - Settings for the various transports.
   * @returns Array of transport instances.
   */
  #createTransports(transportOptions) {
    const logTransports = [];
    const addErrorListener = (transport, transportType) => {
      transport.on('error', (err) => {
        const defaultErrorMessage = `${transportType} transport Error`;
        console.log(`Logging base lib Error: ${err?.message || defaultErrorMessage}`);
      });
    };

    if (transportOptions.console.enabled) {
      let consoleTransport;
      if (transportOptions.console.stdoutFormat === 'json') {
        consoleTransport = new Console(transportOptions.console, self.telemetryService);
      } else {
        consoleTransport = new transports.Console(transportOptions.console);
      }
      addErrorListener(consoleTransport, 'Console');

      logTransports.push(consoleTransport);
    }
    if (transportOptions.file.enabled) {
      const fileTransport = new transports.File(transportOptions.file);
      addErrorListener(fileTransport, 'File');

      logTransports.push(fileTransport);
    }
    if (transportOptions.syslog.enabled) {
      const syslogTransport = new Syslog(transportOptions.syslog, self.telemetryService);
      addErrorListener(syslogTransport, 'Syslog');

      logTransports.push(syslogTransport);
    }
    if (transportOptions.jsonTCP.enabled) {
      const jsonTCPTransport = new JsonTCP(transportOptions.jsonTCP, self.telemetryService);
      addErrorListener(jsonTCPTransport, 'JsonTCP');

      logTransports.push(jsonTCPTransport);
    }
    return logTransports;
  }

  #getLogLevel(loggingConfig, category) {
    const categoryLogLevel = loggingConfig.logLevelCategories?.[category];
    const generalLogLevel = loggingConfig.defaultLogLevel;
    const { defaultLogLevel } = DEFAULT_LOG;

    if (categoryLogLevel && categoryLogLevel in LOG_LEVELS) {
      console.log(
        `Using '${categoryLogLevel}' transport log level value for '${category}' category`,
      );
      return categoryLogLevel;
    }

    if (generalLogLevel && generalLogLevel in LOG_LEVELS) {
      return generalLogLevel;
    }

    console.log(
      `Invalid log level '${generalLogLevel.toLowerCase()}', should be one of: ${Object.keys(
        LOG_LEVELS,
      ).join(', ')}. Using default value: '${defaultLogLevel}'.`,
    );

    return defaultLogLevel;
  }

  #getFacility(transportConfig, defaultFacility, category) {
    const categoryFacility = transportConfig.facilityCategories?.[category];
    const generalFacility = transportConfig.facility || transportConfig.syslogFacility;
    const facilityIDs = Object.keys(FACILITIES);

    if (categoryFacility && facilityIDs.includes(categoryFacility)) {
      console.log(
        `Using '${categoryFacility}' transport facility value for '${category}' category`,
      );
      return categoryFacility;
    }

    if (generalFacility && facilityIDs.includes(generalFacility)) {
      return generalFacility;
    }

    console.log(
      `Invalid transport facility '${generalFacility}', should be one of: ${facilityIDs.join(
        ', ',
      )}. Using default value: '${defaultFacility}'.`,
    );
    return defaultFacility;
  }

  /**
   * Store the logging config for future loggers and reconfigure already existing ones.
   *
   * @param {object} newLogConfig - Config object.
   * @param {boolean} newLogConfig.enabled - Enables logging.
   * @param {string} newLogConfig.serviceName - Log category.
   * @param {string} newLogConfig.defaultLogLevel - Default logging level (=info).
   * @param {object} newLogConfig.logLevelCategories - Levels for certain categories, where key
   * is a category and value is a logging level.
   * @param {ConsoleLogConfig} newLogConfig.stdout - Console logs configuration.
   * @param {FilelogConfig} newLogConfig.filelog - File logs configuration.
   * @param {SyslogConfig} newLogConfig.syslog - Syslog configuration.
   * @param {JsonTCPLogConfig} newLogConfig.jsonTCPLog - Syslog configuration.
   */
  configureLogger(newLogConfig) {
    logConfig = newLogConfig;
    // loggers themselves are the Winston log containers, which have attribute loggers
    loggers.loggers.forEach((_logger, category) =>
      _logger.configure(self._getWinstonConfig(newLogConfig, category)),
    );
  }

  /**
   * Get a logger from the Winston log container. If it does not exist then Winston will create it.
   *
   * @param {string} [category='default'] - Category of the message.
   * @returns {object} Logger object.
   */
  getLogger(category = CONSTANTS.DEFAULT_CATEGORY) {
    const loggerAlreadyExists = loggers.has(category);
    const _logger = loggers.get(category, self._getWinstonConfig(logConfig, category));

    // This check is to prevent EventEmitter memory leak warning
    if (!loggerAlreadyExists) {
      _logger.on('error', (err, transport) => {
        const transportType =
          (transport && Object.getPrototypeOf(transport)?.constructor?.name) || 'Logger';
        const emittedEvent = `${transportType.toLowerCase()}-error`;
        self.emit(emittedEvent, err);
      });
    }

    return _logger;
  }

  /**
   * Set the provided Telemetry Service for the Logger.
   *
   * @param {object} telemetryServiceInstance - An instance of the Telemetry Service.
   * @returns {void}
   */
  setTelemetryService(telemetryServiceInstance) {
    self.telemetryService = telemetryServiceInstance;
  }
}

const logger = new Logger();
export default logger;
