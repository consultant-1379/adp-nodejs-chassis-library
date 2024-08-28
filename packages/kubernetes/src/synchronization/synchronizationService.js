import dns from 'dns';
import os from 'os';
import util from 'util';
import fetch from 'node-fetch';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';

import { DEFAULT_CONFIGS } from '../constants.js';

const LOGGER = Symbol('LOGGER');
const CM = Symbol('CM');
const DST = Symbol('DST');

const lookupOptions = {
  family: 0,
  all: true,
};

class SynchronizationService {
  /**
   * Service for propagating refresh notification
   * for the other pods.
   *
   * @param {object} params - Collection of parameters.
   * @param {object} params.logger - This logger is used for warnings, errors.
   * @param {object} params.certificateManager - Watches the certificates from the helm config of the services.
   * @param {object} params.telemetryService - Tracks the http request of the service.
   * @param {syncConfig} params.syncConfig - Synchronization configuration.
   * Structure of the synchronization configuration is below.
   * @typedef {object} syncConfig
   * @property {string} tlsType - TLS option.
   * @property {string} headerValues - VIA http header from the request.
   * @property {string} headlessServiceName - Name of the headless service.
   * @property {number} servicePort - Port of the request.
   * @property {boolean} useHttps - If true protocol is https, else http.
   */
  constructor({ syncConfig, logger, certificateManager, telemetryService }) {
    this.syncConfig = Object.assign(DEFAULT_CONFIGS, syncConfig);
    this.TLS_TYPE_INTERNAL_REFRESH = this.syncConfig.tlsType;
    this.VIA_HEADER_VALUE = this.syncConfig.headerValues;
    this.headlessServiceName = this.syncConfig.headlessServiceName;
    this.servicePort = this.syncConfig.servicePort;
    this.protocol = this.syncConfig.useHttps ? 'https' : 'http';
    this[CM] = certificateManager;
    this[DST] = telemetryService;

    this[LOGGER] = getLogger(logger);
  }

  async _getIPFor(hostname) {
    const lookup = util.promisify(dns.lookup);
    const ips = await lookup(hostname, lookupOptions);
    // @ts-ignore
    return ips.map((ip) => ip.address);
  }

  async _sendRequest(address, request) {
    if (request.headers?.via) {
      request.headers.via += `,${this.VIA_HEADER_VALUE}`;
    } else {
      request.headers.via = this.VIA_HEADER_VALUE;
    }

    const requestUrl = new URL(
      `${this.protocol}://${address}:${this.servicePort}${request.originalUrl}`,
    );
    const bodyString = JSON.stringify(request.body);

    let requestOptions = {};
    if (this.protocol === 'https') {
      const httpsAgent = this[CM]?.getTLSOptions(this.TLS_TYPE_INTERNAL_REFRESH)?.tlsAgent;
      requestOptions = {
        method: request.method,
        body: bodyString,
        headers: request.headers,
        agent: httpsAgent,
      };
    } else {
      requestOptions = { method: request.method, body: bodyString, headers: request.headers };
    }
    const { span, ctx } = this[DST].createSpan(request, this[DST].spanKindClientId);
    const { headers: dstHeaders } = this[DST].injectContext(ctx);

    requestOptions.headers = { ...requestOptions.headers, dstHeaders };

    // @ts-ignore
    const fetchResponse = await fetch(requestUrl, requestOptions);
    if (fetchResponse.status !== 200) {
      this[LOGGER].warning(`Refresh at ${address} returned with ${fetchResponse.status}`);
    } else {
      this[LOGGER].debug(`Refresh at ${address} returned with ${fetchResponse.status}`);
    }

    this[DST].setHttpResponseSpanOptions(span, fetchResponse);
    span.end();
  }

  async _getLocalIP() {
    return this._getIPFor(os.hostname());
  }

  async _getClusterIPs() {
    return this._getIPFor(this.headlessServiceName);
  }

  /**
   * Method for calculating the necessary ip addresses
   * then notifying the other pods with the refresh request.
   *
   * @param {object} request - The request which is to be sent for other pods.
   */
  async propagateRefresh(request) {
    const localIP = await this._getLocalIP();
    const clusterIPs = await this._getClusterIPs();

    const otherIPs = clusterIPs.filter((ip) => ip !== localIP[0]);

    if (otherIPs.length > 0) {
      this[LOGGER].info(`Sending refresh from ${localIP} to other pods: [${otherIPs}]`);
      await Promise.all(otherIPs.map((ip) => this._sendRequest(ip, request)));
    }
  }
}

export default SynchronizationService;
