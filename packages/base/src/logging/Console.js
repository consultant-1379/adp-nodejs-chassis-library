import TransportStream from 'winston-transport';
import { LEVEL } from 'triple-beam';
import jsonStringify from 'safe-stable-stringify';
import { formatLogDataToJson } from '../utils/loggerHelper.js';

/**
 * Custom Transport for logging to standard output. The transport is based on a winstons transport class, and apply
 * it's own log method for custom logging, which is the same for TCP json logging as well.
 *
 * @extends {TransportStream}
 */
export default class Console extends TransportStream {
  /**
   * @param {object} options - Configurations for this instance.
   * @param {string} options.category - Log category.
   * @param {string} [options.facility=local0] - Facility for the log data.
   * @param {string} [options.podName] - Pod name.
   * @param {string} [options.pid] - By default set to `process.pid`.
   * @param {string} [options.app_name] - By default set to `process.title`.
   * @param {string} [options.appName] - Deprecated (same as app_name).
   * @param {object} [options.metadata] - Additional metadata.
   * @param {string} [options.metadata.namespace] - Namespace.
   * @param {string} [options.metadata.node_name] - Node name.
   * @param {string} [options.metadata.container_name] - Container name.
   * @param {string} [options.metadata.service_version] - Service name with version.
   * @param {string} [options.format] - Format property, which is reserved for winston. Used when stdout format is 'text'.
   * @param {object} [telemetryServiceInstance] - TelemetryService instance.
   */
  constructor(options, telemetryServiceInstance) {
    let initOptions = options;

    if (!initOptions) {
      console.log('Error: no options were passed to the Console logging transport');
      // @ts-ignore
      initOptions = {};
    }

    // @ts-ignore
    super(initOptions);
    this.options = initOptions;
    this.facility = this.options.facility || 'local0';
    this.category = this.options.category;
    this.procID = this.options.pid || process.pid;
    this.appID = this.options.appName || this.options.app_name || process.title;
    this.telemetryService = telemetryServiceInstance;
    this.levels = this.levels || {};
  }

  get name() {
    return 'Console';
  }

  // eslint-disable-next-line consistent-return
  log(info, callback) {
    const level = info[LEVEL];
    if (!this.levels[level]) {
      return callback(new Error(`Unknown log level: ${info[LEVEL]}`));
    }

    const logDataJson = formatLogDataToJson({
      info,
      level,
      transportOptions: this.options,
      traceId: this.telemetryService?.getTraceId(),
      procID: this.procID,
      appID: this.appID,
      transportFacility: this.facility,
    });
    const strLogData = jsonStringify(logDataJson);
    console.log(strLogData);

    if (callback) {
      callback();
    }
  }
}
