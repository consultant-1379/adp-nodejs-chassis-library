import * as net from 'net';
import * as tls from 'tls';
import glossy from 'glossy';
import winston from 'winston';
import Transport from 'winston-transport';
import { MESSAGE, LEVEL } from 'triple-beam';
import { parseProtocol } from './utils.js';
import CONSTANTS from './constants.js';

const { WAIT_FOR_LOG_SERVER, FACILITIES } = CONSTANTS;
const queueMap = new Map();

// Ensure we have the correct winston here.
if (Number(winston.version.split('.')[0]) < 3) {
  throw new Error('Winston-syslog requires winston >= 3.0.0');
}

/**
 * Transport capable of sending RFC 3164 and RFC 5424 compliant messages.
 * @private
 * @extends Transport
 */
class Syslog extends Transport {
  /**
   * @param {object} options - Options for this instance.
   * @param {object} [telemetryServiceInstance] - TelemetryService instance.
   */
  constructor(options, telemetryServiceInstance) {
    let initOptions = options;
    if (!initOptions) {
      console.log('Error: no options were passed to the Syslog logging transport');
      initOptions = {};
    }

    // Inherit from `winston-transport`.
    super(initOptions);

    this.levels = this.levels || undefined;

    // Setup connection state
    this.inFlight = 0;

    this.syslogServerNotAvailableSince = 0;

    // Merge the options for the target Syslog server.
    this.setOptions(initOptions);

    this.telemetryService = telemetryServiceInstance;

    if (!queueMap.has(this.categoryId)) {
      queueMap.set(this.categoryId, []);
    }
    this.queue = queueMap.get(this.categoryId);

    // Setup our Syslog and network members for later use.
    this.socket = null;
    const Producer = initOptions.customProducer || glossy.Produce;
    this.producer = new Producer({
      type: this.type,
      appName: this.appName,
      pid: this.pid,
      facility: this.facility,
    });
  }

  /**
   * Expose the name of this Transport on the prototype.
   *
   * @returns {string} Value 'syslog'.
   */
  get name() {
    return 'syslog';
  }

  /**
   * Set winston syslog configurations.
   *
   * @param {object} options - Set of options.
   * @param {string} options.category - Log category.
   * @param {string} [options.host=localhost] - Host address.
   * @param {number} [options.port=5014] - Port.
   * @param {string} [options.path=null] - Path.
   * @param {string} [options.protocol=tcp4] - Protocol type.
   * @param {object} [options.protocolOptions={}] - Protocol options.
   * @param {string} [options.eol] - End of line.
   * @param {string} [options.localhost=localhost] - Localhost.
   * @param {string} [options.type=RFC5424] - The Syslog Protocol type.
   * @param {string} [options.facility=local0] - Facility for the log producer.
   * @param {string} [options.pid] - By default set to `process.pid`.
   * @param {string} [options.appName] - By default set to `process.title`.
   * @param {string} [options.app_name] - Thee same as `options.app_name`.
   */
  setOptions(options) {
    this.categoryId = options.category;
    this.host = options.host || 'localhost';
    this.port = options.port || 5014;
    this.path = options.path || null;
    this.protocol = options.protocol || 'tcp4';
    this.protocolOptions = options.protocolOptions || {};
    this.endOfLine = options.eol;

    this.parseProtocol(this.protocol);

    // Merge the default message options.
    this.localhost = typeof options.localhost !== 'undefined' ? options.localhost : 'localhost';
    this.type = options.type || 'RFC5424';
    this.facility = options.facility || 'local0';
    this.pid = options.pid || process.pid;
    this.appName = options.appName || options.app_name || process.title;
  }

  /**
   * Parse and store protocol.
   *
   * @param {string} [protocol] - By default set to `this.protocol`.
   */
  parseProtocol(protocol = this.protocol) {
    const parsedProtocol = parseProtocol(protocol);
    this.protocolType = parsedProtocol.type;
    this.protocolFamily = parsedProtocol.family;
  }

  /**
   * Checks if structuredData parameters have been passed and generates the result object.
   *
   * @param {object} info - Logging information.
   * @returns {object|null} Resulted structuredData object.
   */
  #getStructuredData(info) {
    const traceId = this.telemetryService?.getTraceId();
    const structuredData = {
      ...info.meta?.structuredData,
      ...(info.extraInfo && { extra_info: info.extraInfo }),
      ...(traceId && { dst: { trace_id: traceId } }),
    };
    const dataNotEmpty = !!Object.keys(structuredData).length;

    return dataNotEmpty ? structuredData : null;
  }

  /**
   * Core logging method exposed to Winston. Logs the `msg` and optional
   * metadata, `meta`, to the specified `level`.
   *
   * @param {object} info - All relevant log information.
   * @param {Function} callback - Continuation to respond to when complete.
   * @returns {Function} Result of `connect()` method invocation.
   */
  log(info, callback) {
    let level = info[LEVEL];
    if (!this.levels[level]) {
      return callback(new Error(`Cannot log unknown syslog level: ${info[LEVEL]}`));
    }
    level = level === 'warn' ? 'warning' : level;
    const output = info[MESSAGE];
    // Facility can be passed with a message info or can be taken from the transport options
    const facility = info.facility && FACILITIES[info.facility] ? info.facility : this.facility;

    const syslogMsg = this.producer.produce({
      severity: level,
      host: info?.meta?.host,
      msgID: info?.meta?.msgID,
      date: new Date(),
      message: this.endOfLine ? `${output}${this.endOfLine}` : output,
      structuredData: this.#getStructuredData(info),
      facility,
    });

    // Attempt to connect to the socket
    return this.connect((err) => {
      if (err) {
        // If there was an error enqueue the message
        this.queue.push(syslogMsg);
        return callback();
      }

      // On any error writing to the socket, enqueue the message
      const onError = (logErr) => {
        if (logErr) {
          this.queue.push(syslogMsg);
        }
        this.emit('logged', info);
        this.inFlight -= 1;
        return callback(null, true);
      };
      this.socket.write(syslogMsg, 'utf8', onError);
      this.inFlight += 1;
      return true;
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
        if (this.socket && this.socket.destroy) {
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

  /**
   * Connects to the remote syslog server using `dgram` or `net` depending
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

    if (this.syslogServerNotAvailableSince + WAIT_FOR_LOG_SERVER > new Date().getTime()) {
      callback(true);
      return null;
    }

    // Create the appropriate socket type.
    const connectConfig = { ...this.protocolOptions, host: this.host, port: this.port };
    const isTls = /^tls[4|6]?$/.test(this.protocol);

    if (this.protocolFamily) {
      connectConfig.family = this.protocolFamily;
    }

    if (isTls) {
      this.socket = tls.connect(connectConfig);
    } else {
      this.socket = new net.Socket().connect(connectConfig);
    }

    this.setupEvents(this.socket);
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
   * @param {Object} socket
   */
  setupEvents(socket) {
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
        console.error(`Syslog Error, terminating connection\n${logErr}`);
        // @ts-ignore
        if (logErr.code === 'ENOTFOUND') {
          console.error(
            `logtransfomer is not available. Stopping syslog sending for ${WAIT_FOR_LOG_SERVER} ms`,
          );
          this.syslogServerNotAvailableSince = new Date().getTime();
        }
        this.emit('error', new Error('Syslog Error, connection terminated.'));
      }
      if (socket && socket.destroy) {
        socket.destroy();
      }
    };

    // Listen to the appropriate events on the socket that
    // was just created.
    socket
      .on(readyEvent, () => {
        // When the socket is ready, write the current queue
        // to it.
        socket.write(this.queue.join(''), 'utf8', onError);

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
}
// @ts-ignore
winston.transports.Syslog = Syslog;

export default Syslog;
