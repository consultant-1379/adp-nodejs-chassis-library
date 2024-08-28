import * as fs from 'fs';
import * as https from 'https';
import * as tls from 'tls';
import * as path from 'path';
import lodash from 'lodash';
import { EventEmitter } from 'events';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import { watchFile, stopFileWatch } from '../utils/fileHelper.js';

const { debounce } = lodash;

const VERIFY_SERVER_CERT_DEFAULT = true;
const SEND_CLIENT_CERT_DEFAULT = true;

const createTlsAgent = ({ verifyServerCert, ca, cert, key }) => {
  const options = {
    keepAlive: true,
    rejectUnauthorized: verifyServerCert,
    ca,
    cert,
    key,
    ALPNProtocols: ['http/1.1'], // Enable ALPN negotiation. For some server the TLS not working without ALPN
  };
  return new https.Agent(options);
};

/**
 * Manages certificates for TLS enabled services.
 *
 * @extends EventEmitter
 */
class CertificateManager extends EventEmitter {
  /**
   * Sets basic configs for the manager and starts watching certificates if TLS is globally enabled.
   *
   * @param {object} options - Set of options.
   * @param {boolean} options.tlsEnabled - True if TLS enabled globally.
   * @param {object} options.dependenciesConfig - Dependencies configuration.
   * @param {string} options.certificatePath - Path to the folder containing the certificates.
   * @param {number} options.certificateWatchDebounceTime - Delay time in ms.
   * @param {object} [options.certificateConfig] - Certificates configuration.
   * @param {string} [options.certificateConfig.ca] - The name of the CA.
   * @param {string} [options.certificateConfig.key] - The name of the key file.
   * @param {string} [options.certificateConfig.cert] - The name of the certificate.
   * @param {object} [options.serverCertificateConfig] - Server certificates configuration.
   * @param {string} [options.serverCertificateConfig.certDir] - Certificate and key file directory.
   * @param {Array<string>} [options.serverCertificateConfig.caCertDirs] - Array of CA directories
   * or paths for CA file.
   * @param {string} [options.serverCertificateConfig.key] - The name of the key file.
   * @param {string} [options.serverCertificateConfig.cert] - The name of the certificate.
   * @param {boolean} [options.serverCertificateConfig.verifyClientCert] - Indicates that it's needed
   * to verify client certificate.
   * @param {object} [options.logger] - Logger instance.
   */
  constructor(options) {
    super();
    const { tlsEnabled, dependenciesConfig, logger, serverCertificateConfig } = options;
    this.tlsServices = {};
    this.options = options;
    this.logger = getLogger(logger);
    if (tlsEnabled) {
      this.tlsServices = this._createTLSServiceMap(dependenciesConfig);
      this._startCertificateWatch();
      if (serverCertificateConfig) {
        this._startServerCertificateWatch();
      }
    }
  }

  /**
   * @typedef {object} TlsConfig
   * @property {boolean} enabled - Whether to use TLS for the service.
   * @property {boolean} [verifyServerCert=true] - Whether the peer service's server certificate
   * should be verified against the root CA. The default value is true.
   * @property {boolean} [sendClientCert=true] - Whether to use TLS client authentication.
   * The default value is true.
   */

  /**
   * Creates a base object filled with enabled services.
   * @private
   *
   * @param {Object<string, TlsConfig>} dependencyConfigMap - The dependencies config in JSON
   * format. The service options object should contain a TlsOption object.
   * @returns {object} Enabled services.
   */
  _createTLSServiceMap(dependencyConfigMap) {
    const tlsServices = {};
    Object.entries(dependencyConfigMap).forEach(([serviceName, config]) => {
      if (config.enabled) {
        tlsServices[serviceName] = {
          tlsAgent: undefined,
          watcher: undefined,
          secureContext: null,
        };
      }
    });
    return tlsServices;
  }

  /**
   * Loads the certificates and keys for all TLS enabled services, to be used in the future with
   * the HTTPS agent specific to each service. The files are watched for new changes and reloads
   * them when a change occurs.
   * As usually the certificates are renewed at the same time for the same service,
   * a debounced version of the file watch callback is created or each service.
   * @private
   */
  _startCertificateWatch() {
    const { certificatePath, certificateWatchDebounceTime } = this.options;
    Object.keys(this.tlsServices).forEach((serviceName) => {
      const serviceCertDir = path.join(certificatePath, serviceName);

      this._readServiceCertificate({ serviceName, serviceCertDir });
      const debouncedCertWatch = debounce(() => {
        this.logger.info(
          `TLS CA, client certificate or client key changed for service ${serviceName}, reloading certificates`,
        );
        this._readServiceCertificate({ serviceName, serviceCertDir });
      }, certificateWatchDebounceTime);

      if (!this.tlsServices[serviceName].watcher) {
        this.tlsServices[serviceName].watcher = watchFile(
          serviceCertDir,
          debouncedCertWatch,
          this.logger,
        );
      }
      return serviceName;
    });
  }

  /**
   * Loads all server CAs, certificates and keys. These files are watched
   * for new changes and reloads them when a change occurs.
   * @private
   */
  _startServerCertificateWatch() {
    const {
      certificateWatchDebounceTime,
      certificatePath,
      serverCertificateConfig: { certDir, caCertDirs, verifyClientCert },
    } = this.options;
    const certDirs = [certDir, ...(verifyClientCert ? caCertDirs : [])];
    this._readServerCertificate();
    const debouncedCertWatch = debounce(() => {
      this.logger.info(`TLS CA, server certificate or server key changed, reloading certificates`);
      this._readServerCertificate();
    }, certificateWatchDebounceTime);
    certDirs.forEach((dir) => {
      const cDir = path.join(certificatePath, dir);
      const watcherProp = `${cDir}Watcher`;
      if (!this[watcherProp]) {
        this[watcherProp] = watchFile(cDir, debouncedCertWatch, this.logger);
      }
    });
  }

  /**
   * Read the certificates and keys used in TLS communication.
   * Where the CA, the certificate and the private key files are found in PEM format.
   *
   * @private
   * @throws Will throw an error if could not read certificate files.
   */
  _readServerCertificate() {
    const {
      serverCertificateConfig: { certDir, caCertDirs, cert, key, verifyClientCert },
      certificatePath,
    } = this.options;
    const _ca = [];
    let _cert;
    let _key;
    try {
      if (verifyClientCert) {
        caCertDirs.forEach((caDir) => {
          const certFilePath = this._findCertificateFile(caDir);
          if (fs.existsSync(certFilePath)) {
            _ca.push(fs.readFileSync(certFilePath, 'utf8'));
          }
        });
      }
      _key = fs.readFileSync(path.join(certificatePath, certDir, key), 'utf8');
      _cert = fs.readFileSync(path.join(certificatePath, certDir, cert), 'utf8');
      this.serverHttpsOpts = {
        ca: _ca,
        cert: _cert,
        key: _key,
        requestCert: verifyClientCert,
        minVersion: 'TLSv1.2',
      };

      this.emit('server-certificates-changed', certDir);
    } catch (error) {
      this.logger.error(`Could not read server certificate files`, error);

      this.emit('server-certificates-read-error', certDir);
      throw error;
    }
  }

  /**
   * Checks if certificate folder contains certificate and returns the path
   * for the certificate.
   *
   * @param {string} folderName - CA certificate folder name.
   * @returns {string|null} Path to the CA certificate.
   * @private
   */
  _findCertificateFile(folderName) {
    const { certificatePath } = this.options;
    const folderPath = path.join(certificatePath, folderName);
    if (fs.existsSync(folderPath)) {
      if (this._isCaFile(folderPath)) {
        return folderPath;
      }
      const certFile = fs.readdirSync(folderPath).filter((fn) => fn.endsWith('.pem'))[0];
      if (certFile) {
        return path.join(folderPath, certFile);
      }
    }
    return null;
  }

  /**
   * Check if it is path for CA file
   * @param {string} certPath
   * @private
   */
  _isCaFile(certPath) {
    return certPath.endsWith('.pem') || certPath.endsWith('.crt');
  }

  /**
   * Read the certificates and keys used in TLS communication with a peer service. When read
   * it updates the secure context for that peer service.
   * @private
   *
   * @param {object} params - Set of parameters.
   * @param {string} params.serviceName - The name of the TLS service.
   * @param {string} params.serviceCertDir - The path to the certificate directory of the service
   * where the CA, the certificate and the private key files are found in PEM format.
   * @throws Will throw an error if could not read certificate files.
   */
  _readServiceCertificate({ serviceName, serviceCertDir }) {
    const { dependenciesConfig, certificatePath, certificateConfig } = this.options;
    const {
      sendClientCert = SEND_CLIENT_CERT_DEFAULT,
      verifyServerCert = VERIFY_SERVER_CERT_DEFAULT,
    } = dependenciesConfig[serviceName].tls;
    let ca;
    let cert;
    let key;
    try {
      if (verifyServerCert) {
        ca = fs.readFileSync(path.join(certificatePath, 'root', certificateConfig.ca), 'utf-8');
      }
      if (sendClientCert) {
        key = fs.readFileSync(path.join(serviceCertDir, certificateConfig.key), 'utf-8');
        cert = fs.readFileSync(path.join(serviceCertDir, certificateConfig.cert), 'utf-8');
      }
      // re-create agent with up-to-date options (flags, key, certificate, etc.)
      this.tlsServices[serviceName].tlsAgent = createTlsAgent({ verifyServerCert, ca, cert, key });

      // secureContext attribute is only used by logging module, it is not official agent option
      const secureContext = tls.createSecureContext({ ca, cert, key, minVersion: 'TLSv1.2' });
      this.tlsServices[serviceName].secureContext = secureContext;

      this.emit('certificates-changed', serviceName);
    } catch (error) {
      this.logger.error(`Could not read certificate files for ${serviceName}`, error);

      this.emit('certificates-read-error', serviceName);
      throw error;
    }
  }

  /**
   * Stops monitoring certificate changes and removes all event listeners.
   */
  stopCertificateWatch() {
    Object.values(this.tlsServices).forEach((tlsService) => {
      if (tlsService.watcher) {
        stopFileWatch(tlsService.watcher, this.logger);
      }
    });
    this.removeAllListeners();
  }

  /**
   * Stops monitoring server certificate changes and removes all event listeners.
   */
  stopServerCertificateWatch() {
    const {
      serverCertificateConfig: { certDir, caCertDirs, verifyClientCert },
    } = this.options;

    [certDir, ...(verifyClientCert ? caCertDirs : [])].forEach((cert) => {
      const watcher = this[cert];
      if (watcher) {
        stopFileWatch(watcher, this.logger);
      }
    });
    this.removeAllListeners();
  }

  /**
   * Returns object with TLS options for a given service.
   *
   * @param {string} serviceName - The name of the service, it should be the same key which is
   * used in the options.dependenciesConfig.
   * @returns {object} An object which contains the https configuration options.
   */
  getTLSOptions(serviceName) {
    const tlsService = this.tlsServices[serviceName];
    if (!tlsService) {
      this.logger.debug(`TLS is disabled for service: ${serviceName}`);
      return null;
    }
    return {
      secureContext: tlsService.secureContext,
      tlsAgent: tlsService.tlsAgent,
    };
  }

  /**
   * Returns server https options.
   *
   * @returns {object|null} Server https options.
   * @public
   */
  getServerHttpsOpts() {
    const { serverHttpsOpts } = this;
    if (!serverHttpsOpts) {
      this.logger.debug(`Server HTTPS options are not available.\n
      Check if serverCertificateConfig is set.`);
      return null;
    }
    return this.serverHttpsOpts;
  }
}

export default CertificateManager;
