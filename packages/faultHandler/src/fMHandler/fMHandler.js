import fetch from 'node-fetch';
import * as jsonschema from 'jsonschema';
import { getFaultIndication } from '../utils/faultIndicationService.js';
import faultManagerSchema from '../schemas/faultManagerConfig.js';
import faultIndicationMapSchema from '../schemas/faultIndicationMap.js';

const { Validator } = jsonschema;

const FAULT_MANAGER_CONFIG = Symbol('FAULT_MANAGER_CONFIG');
const FAULT_INDICATION_MAP = Symbol('FAULT_INDICATION_MAP');
const LOGGER = Symbol('LOGGER');
const TLS_AGENT = Symbol('TLS_AGENT');
const HOST_NAME = Symbol('HOST_NAME');
const PORT = Symbol('PORT');
const PROTOCOL = Symbol('PROTOCOL');
const USE_HTTPS = Symbol('USE_HTTPS');
const PRODUCE_FAULT_REQ = 'alarm-handler/v1/fault-indications';
const POST_METHOD = 'POST';

const validator = new Validator();

/**
 * Validate config manager
 * @private
 *
 * @param {object} config
 * @param {string} config.hostname
 * @param {string} config.tlsPort
 * @param {string} config.httpPort
 * @param {string} config.serviceName
 * @param {boolean} config.enabled
 */
function validateFaultManager(config) {
  const result = validator.validate(config, faultManagerSchema);

  if (!result.valid) {
    throw new Error(`Validation failed for fault manager config: ${result.errors}`);
  }
}

/**
 * Validate fault indication map with schema.
 * @private
 *
 * @param {object} config - Fault indication map
 * This map must be based on Fault Indication JSON Schema, see
 * https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-indication-schema-definition
 */
function validateFaultIndication(config) {
  let errorMsg = '';
  Object.entries(config).forEach(([key, value]) => {
    const result = validator.validate(value, faultIndicationMapSchema);

    if (!result.valid) {
      errorMsg += `Validation failed for fault indication map, '${key}': ${result.errors}\n`;
    }
  });

  if (errorMsg) {
    throw new Error(errorMsg);
  }
}

class FaultHandler {
  /**
   * Initialize a FaultHandler.
   *
   * @param {object} options - Set of options.
   * @param {object} [options.logger] - The logger which will be used for logging.
   * @param {object} options.faultManagerConfig - Fault manager config.
   * @param {string} options.faultManagerConfig.clientId - Client ID.
   * @param {object} options.faultManagerConfig.tls - TLS configuration.
   * @param {boolean} options.faultManagerConfig.tls.enabled - True is TLS enabled.
   * @param {string} options.faultManagerConfig.hostname - Fault manager broker's hostname.
   * @param {string} options.faultManagerConfig.tlsPort - Fault manager tls port.
   * @param {string} options.faultManagerConfig.httpPort - Fault manager http port.
   * @param {string} options.faultManagerConfig.serviceName - Name of the service.
   * @param {boolean} options.faultManagerConfig.enabled - Sets if fault indications should be
   * produced.
   * @param {object} options.faultIndicationMap - Fault indication map. This map must be based on
   * Fault Indication JSON Schema, see
   * {@link https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-indication-schema-definition|details}.
   * @param {boolean} options.useHttps - True if https mode is used.
   * @param {object} options.tlsAgent - TLS agent for security connection.
   * @throws {Error} Configuration file for the faultHandler must be provided.
   * @throws {Error} Configuration file for the faultHandler must be consistent with the JSON
   * Schema.
   * @throws {Error} Fault indication map must be correct.
   * @throws {Error} Fault indication map must be consistent with the JSON Schema.
   */
  constructor(options) {
    const { faultManagerConfig, faultIndicationMap, logger, useHttps, tlsAgent } = options;

    if (faultIndicationMap) {
      validateFaultIndication(faultIndicationMap);
      this[FAULT_INDICATION_MAP] = faultIndicationMap;
    } else {
      throw new Error('Please provide fault indication map');
    }

    this.#setLogger(logger);

    this.setConfig({ faultManagerConfig, useHttps, tlsAgent });
  }

  /**
   * Send fault indication to FI REST interface see
   * {@link https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/user-guide|link}
   * for details.
   *
   * @param {object} fIData - Fault indication metadata.
   * @param {string} fIData.fault - Alias for the fault, as per faultIndicationDefaultMap.
   * @param {object} fIData.customConfig - Additional parameters to override the defaults fault
   * indications.
   * @returns { Promise<object> } Response of FI REST endpoint.
   */
  async produceFaultIndication(fIData) {
    if (this[FAULT_MANAGER_CONFIG].enabled) {
      if (this[USE_HTTPS] && !this[TLS_AGENT]) {
        this[LOGGER].info('TLS is on, but certificates are not read yet.');
        return Promise.resolve(false);
      }
      try {
        const faultIndication = getFaultIndication({
          FI_DEFAULTS: this[FAULT_INDICATION_MAP],
          serviceName: this[FAULT_MANAGER_CONFIG]?.serviceName,
          ...fIData,
        });

        const data = JSON.stringify(faultIndication);

        const resp = await fetch(
          `${this[PROTOCOL]}://${this[HOST_NAME]}:${this[PORT]}/${PRODUCE_FAULT_REQ}`,
          {
            agent: this[TLS_AGENT],
            method: POST_METHOD,
            headers: { 'Content-Type': 'application/json' },
            body: data,
          },
        );

        if (resp.status !== 204) {
          this[LOGGER].warning(`Request for producing FI returned with status ${resp.status}`);
          return Promise.resolve(false);
        }

        this[LOGGER].info(`${fIData.fault} - fault indication produced.`);
        return resp;
      } catch (error) {
        this[LOGGER].error(`Fault indication producing failed: ${error.name} - ${error.message}.`);
        return Promise.resolve(false);
      }
    } else {
      this[LOGGER].info('Fault management is disabled.');
      return Promise.resolve(false);
    }
  }

  /**
   * Set fault manager config.
   *
   * @param {object} options - Set of options.
   * @param {object} [options.logger] - The logger which will be used for logging.
   * @param {object} options.faultManagerConfig - Fault manager config.
   * @param {boolean} options.useHttps - True if https mode is used.
   * @param {object} options.tlsAgent - TLS agent for security connection.
   * @throws {Error} If the fm config is missing.
   */
  setConfig({ logger, faultManagerConfig, useHttps, tlsAgent }) {
    if (faultManagerConfig) {
      validateFaultManager(faultManagerConfig);
      this[FAULT_MANAGER_CONFIG] = faultManagerConfig;
    } else {
      throw new Error('Please provide fault manager config');
    }

    const { tlsPort, httpPort, hostname } = faultManagerConfig;

    this[PORT] = useHttps ? tlsPort : httpPort;
    this[PROTOCOL] = useHttps ? 'https' : 'http';
    this[TLS_AGENT] = tlsAgent;
    this[HOST_NAME] = hostname;
    this[USE_HTTPS] = useHttps;

    if (logger) {
      this.#setLogger(logger);
    }
  }

  #setLogger(logger) {
    if (logger) {
      this[LOGGER] = logger;
    } else {
      this[LOGGER] = {
        error(msg) {
          console.log(msg);
        },
        info(msg) {
          console.log(msg);
        },
        log({ message }) {
          console.log(message);
        },
      };
    }
  }
}

export default FaultHandler;
