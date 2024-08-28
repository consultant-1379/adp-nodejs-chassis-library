import { existsSync, readFileSync } from 'fs';
import { Agent } from 'https';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';

/**
 * Generates a constant TLS options.
 */
class NonTLSCertificateManager {
  /**
   * Sets basic configs for the manager.
   *
   * @param {object} options - Set of options.
   * @param {string} options.serviceName - Name of the service.
   * @param {string} options.serverCertPath - Path to the service certificate.
   * @param {object} [options.logger] - Logger instance.
   */
  constructor(options) {
    this.options = options;
    this.logger = getLogger(options.logger);
  }

  /**
   * Returns object with TLS options for a given service.
   *
   * @returns {object} An object which contains a configured tlsAgent object.
   */
  getTLSOptions() {
    const tlsAgent = new Agent({
      keepAlive: true,
      rejectUnauthorized: true,
      ca: this.#readCertificate(),
      ALPNProtocols: ['http/1.1'],
    });
    return {
      tlsAgent,
    };
  }

  #readCertificate() {
    const { serverCertPath, serviceName } = this.options;
    let serverCert = '';

    if (existsSync(serverCertPath)) {
      serverCert = readFileSync(serverCertPath, 'utf-8');
    } else {
      this.logger.error(`${serviceName} certificate does not exist at: ${serverCertPath}`);
    }

    return serverCert;
  }
}

export default NonTLSCertificateManager;
