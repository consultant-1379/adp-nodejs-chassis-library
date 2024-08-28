import * as net from 'net';
import * as tls from 'tls';
import Transport from 'winston-transport';
import { LEVEL } from 'triple-beam';
import jsonStringify from 'safe-stable-stringify';
import { parseProtocol } from './utils.js';
import CONSTANTS from './constants.js';
import { formatLogDataToJson } from '../utils/loggerHelper.js';

const { WAIT_FOR_LOG_SERVER } = CONSTANTS;
const queueMap = new Map();

/**
 * Transport for outputting to a JSON/TCP server.
 *
 * @extends {Transport}
 * @fires logged
 * @fires error
 * @fires closed
 */
export default class JsonTCP extends Transport {
  /**
   * @param {object} options - Configurations for this instance.
   * @param {string} options.category - Log category.
   * @param {boolean} options.tls - Whether connection secure or not.
   * @param {string} [options.host=localhost] - Host address.
   * @param {number} [options.port] - Port.
   * @param {string} [options.path=null] - Path.
   * @param {string} [options.protocol=tcp4] - Protocol type.
   * @param {object} [options.protocolOptions={}] - Protocol options.
   * @param {string} [options.logSeparator=`\n`] - Separator between log data sent to the Log Transformer.
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
   * @param {object} [telemetryServiceInstance] - TelemetryService instance.
   */
  constructor(options, telemetryServiceInstance) {
    let initOptions = options;
    if (!initOptions) {
      console.log('Error: no options were passed to the JsonTCP logging transport');
      // @ts-ignore
      initOptions = {};
    }

    // @ts-ignore
    super(initOptions);

    this.options = initOptions;
    this.tls = this.options.tls;
    this.facility = this.options.facility || 'local0';
    this.category = this.options.category;
    this.host = this.options.host || 'localhost';
    this.port = this.options.port;
    this.protocol = this.options.protocol || 'tcp4';
    this.procID = this.options.pid || process.pid;
    this.appID = this.options.appName || this.options.app_name || process.title;
    this.protocolOptions = this.options.protocolOptions;
    this.protocolFamily = parseProtocol(this.protocol)?.family;
    // According to the JSON TCP Interface of Log Transformer
    // each event must be separated with a newline
    this.logSeparator = this.options.logSeparator || '\n';
    this.telemetryService = telemetryServiceInstance;
    this.levels = this.levels || {};

    // Setup connection state
    this.inFlight = 0;
    this.logServerNotAvailableSince = 0;
    this.socket = null;

    if (!queueMap.has(this.category)) {
      queueMap.set(this.category, []);
    }
    this.queue = queueMap.get(this.category);
  }

  /**
   * Expose the name of this Transport on the prototype.
   *
   * @returns {string} The name, 'jsonTCP'.
   */
  get name() {
    return 'jsonTCP';
  }

  /**
   * Core logging method exposed to Winston.
   *
   * @param {object} info -  All relevant log information.
   * @param {Function} callback - Continuation to respond to when complete.
   * @returns {Function} Result of `connect()` method invocation.
   */
  log(info, callback) {
    const level = info[LEVEL];
    if (!this.levels[level]) {
      return callback(new Error(`Unknown log level: ${info[LEVEL]}`));
    }

    const logData = formatLogDataToJson({
      info,
      level,
      transportOptions: this.options,
      traceId: this.telemetryService?.getTraceId(),
      appID: this.appID,
      procID: this.procID,
      transportFacility: this.facility,
    });

    // According to the JSON TCP Interface of Log Transformer
    // no newlines are allowed within message.
    logData.message = logData.message.replace(/\n/g, '\\n');
    const strLogData = jsonStringify(logData) + this.logSeparator;

    // Attempt to connect to the socket
    return this.connect((err) => {
      if (err) {
        // If there was an error enqueue the message
        this.queue.push(strLogData);
        return callback();
      }

      // On any error writing to the socket, enqueue the message
      const onError = (logErr) => {
        if (logErr) {
          this.queue.push(strLogData);
        }
        this.emit('logged', info);
        this.inFlight -= 1;
        return callback(null, true);
      };
      this.socket.write(strLogData, 'utf8', onError);
      this.inFlight += 1;
      return true;
    });
  }

  /**
   * Connects to the remote Log Transformer server using `dgram` or `net` depending
   * on the `protocol` for this instance.
   *
   * @param {Function} callback - Continuation to respond to when complete.
   * @returns {Function|null} Callback invocation or null.
   */
  connect(callback) {
    // If the socket already exists then respond
    if (this.socket) {
      // @ts-ignore
      if (!this.socket.connecting && this.socket.readyState === 'closed') {
        this.socket.destroy();
      } else {
        // @ts-ignore
        return !this.socket.readyState || this.socket.readyState === 'open' || this.socket.connected
          ? callback(null)
          : callback(true);
      }
    }

    if (this.logServerNotAvailableSince + WAIT_FOR_LOG_SERVER > new Date().getTime()) {
      callback(true);
      return null;
    }

    // Create the appropriate socket type.
    const connectConfig = { ...this.protocolOptions, host: this.host, port: this.port };

    if (this.protocolFamily) {
      connectConfig.family = this.protocolFamily;
    }

    if (this.tls) {
      this.socket = tls.connect(connectConfig);
    } else {
      this.socket = new net.Socket().connect(connectConfig);
    }

    this._setupEvents(this.socket);
    this.socket.setKeepAlive(true);
    this.socket.setNoDelay();

    // Indicate to the callee that the socket is not ready. This
    // will enqueue the current message for later.
    callback(true);
    return null;
  }

  /**
   * Setup events on the socket
   * @private
   *
   * @param {object} socket
   */
  _setupEvents(socket) {
    const readyEvent = 'connect';
    // On any error writing to the socket, emit the `logged` event
    // and the `error` event.
    const onError = (logErr) => {
      if (logErr) {
        this.emit('error', logErr);
      }
      this.emit('logged');
      this.inFlight -= 1;
    };

    /**
     * By terminating the socket a new socket will be created the next time when
     * the log method - thus the net/tls.connect method - is invoked so valid
     * certificates will be used.
     */
    const terminateSocket = (logErr) => {
      // @ts-ignore
      if (logErr instanceof Error && logErr.code !== 'ETIMEDOUT') {
        console.error(`JsonTCP Error, terminating connection\n${logErr}`);
        // @ts-ignore
        if (logErr.code === 'ENOTFOUND') {
          console.error(
            `logtransfomer is not available. Stopping jsonTCP sending for ${WAIT_FOR_LOG_SERVER} ms`,
          );
          this.logServerNotAvailableSince = new Date().getTime();
        }
        this.emit('error', new Error('JsonTLS transport Error, connection terminated.'));
      }
      if (socket?.destroy) {
        socket.destroy();
      }
    };

    // Listen to the appropriate events on the socket that was just created.
    socket
      .on(readyEvent, () => {
        // When the socket is ready, write the current queue to it.
        socket.write(this.queue.join(this.logSeparator), 'utf8', onError);

        this.emit('logged');
        this.queue.splice(0);
      })
      .on('error', terminateSocket)
      .on('close', terminateSocket)
      .on('timeout', () => {
        if (socket.destroy) {
          // https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback
          socket.destroy();
        } else if (socket.close) {
          // https://nodejs.org/api/dgram.html#dgram_socket_close_callback
          // https://www.npmjs.com/package/unix-dgram#socketclose
          socket.close();
        }
      });
  }

  /**
   * Closes the socket used by this transport freeing the resource.
   */
  close() {
    const max = 6;
    let attempt = 0;

    const _close = () => {
      if (attempt >= max || (this.queue.length === 0 && this.inFlight <= 0)) {
        if (this.socket?.destroy) {
          // https://nodejs.org/api/net.html#net_socket_destroy_exception
          this.socket.destroy();
        }
        this.emit('closed', this.socket);
      } else {
        attempt += 1;
        setTimeout(_close, 200 * attempt);
      }
    };
    _close();
  }
}
