import fetch from 'node-fetch';

const GET_LICENSES_REQ = 'license-manager/api/v1/licenses/requests';
const POST_METHOD = 'POST';

const LICENSE_MANAGER_CONFIG = Symbol('LICENSE_MANAGER_CONFIG');
const LOGGER = Symbol('LOGGER');
const TLS_AGENT = Symbol('TLS_AGENT');
const SECURE_CONTEXT = Symbol('SECURE_CONTEXT');
const USE_HTTPS = Symbol('USE_HTTPS');

class LicenseManager {
  /**
   * Initialize a LicenseManager.
   *
   * @param {object} options - Set of options.
   * @param {object} [options.logger] - The logger which will be used for logging.
   * @param {object} options.licenseManagerConfig - License manager config.
   * @param {string} options.licenseManagerConfig.hostname - License manager hostname.
   * @param {string} options.licenseManagerConfig.tlsPort - License manager tls port.
   * @param {string} options.licenseManagerConfig.httpPort - License manager http port.
   * @param {string} options.licenseManagerConfig.productType - Product type of licenses
   * which should be checked.
   * @param {Array<object>} options.licenseManagerConfig.licenses - Array of licenses
   * which should be checked.
   * @param {boolean} options.useHttps - True if https mode is used.
   * @param {object} options.secureContext - Security context for security connection.
   * @param {object} options.tlsAgent - TLS agent for security connection.
   */
  constructor(options) {
    this.setLicenseManagerConfig(options);
  }

  /**
   * Read detailed licenses information.
   *
   * @public
   * @async
   * @returns {Promise} Request promise.
   */
  async readLicensesInfo() {
    const { hostname, tlsPort, httpPort, productType, licenses } = this[LICENSE_MANAGER_CONFIG];
    const useHttps = this[USE_HTTPS];
    const port = useHttps ? tlsPort : httpPort;
    const logger = this[LOGGER];
    const protocol = useHttps ? 'https' : 'http';
    const isTls = protocol === 'https';
    if (isTls && !this[SECURE_CONTEXT]) {
      logger.info('TLS is on, but certificates are not read yet.');
      return Promise.resolve(false);
    }

    const data = JSON.stringify({
      productType,
      licenses,
    });
    try {
      const response = await fetch(`${protocol}://${hostname}:${port}/${GET_LICENSES_REQ}`, {
        agent: this[TLS_AGENT],
        method: POST_METHOD,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      });
      if (response.status !== 200) {
        logger.warning(`Request for licenses information returned with status ${response.status}`);
        return Promise.resolve(false);
      }
      return response.json();
    } catch (err) {
      logger.error(err.message);
      return Promise.resolve(false);
    }
  }

  /**
   * Set license manager config.
   *
   * @param {object} options - Set of options.
   * @param {object} [options.logger] - The logger which will be used for logging.
   * @param {object} options.licenseManagerConfig - License manager config.
   * @param {boolean} options.useHttps - True if https mode is used.
   * @param {object} options.secureContext - Security context for security connection.
   * @param {object} options.tlsAgent - TLS agent for security connection.
   */
  setLicenseManagerConfig({ logger, licenseManagerConfig, useHttps, secureContext, tlsAgent }) {
    this[LICENSE_MANAGER_CONFIG] = licenseManagerConfig;
    this[LOGGER] = logger;
    this[USE_HTTPS] = useHttps;
    this[SECURE_CONTEXT] = secureContext;
    this[TLS_AGENT] = tlsAgent;
  }
}

export default LicenseManager;
