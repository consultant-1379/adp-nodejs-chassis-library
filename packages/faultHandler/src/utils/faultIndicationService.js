import * as jsonschema from 'jsonschema';
import faultIndicationSchema from '../schemas/faultIndication.js';

const { Validator } = jsonschema;

const validator = new Validator();

/**
 * Apply custom config props for default config
 * @private
 * @param {Object} config - Default config
 * @param {Object} customConfig - Custom config.
 * See {@link http://json-schema.org/draft-04/schema#|link} for additional details
 * @returns {Object}
 */
function applyCustomConfig(config, customConfig) {
  if (customConfig.faultName) {
    console.log(`Fault name can't be overridden in fault indication custom config:
    { faultName: ${customConfig.faultName} }`);
  }
  return Object.assign(config, customConfig);
}

/**
 * Validate fault indication config with Fault Indication Schema
 * @private
 * @param {Object} config - Fault indication config.
 * See {@link http://json-schema.org/draft-04/schema#|link} for additional details
 */
function validateFaultIndicationConfig(config) {
  const result = validator.validate(config, faultIndicationSchema);

  if (!result.valid) {
    throw new Error(`Validation failed for fault indication config: ${result.errors}`);
  }
}

/**
 * Get fault indication
 * @private
 * @param {Object} params
 * @param {Object} params.fault - Alias for the fault, as per faultIndicationDefaultMap
 * @param {Object} [params.customConfig] - Custom fault indication config.
 * See {@link http://json-schema.org/draft-04/schema#|link} for additional details
 * @param {Object} params.serviceName
 * @param {Object} params.FI_DEFAULTS -  Fault indication map
 * @returns {Object|null}
 */
function getFaultIndication({ fault, customConfig, serviceName, FI_DEFAULTS }) {
  if (!fault) {
    throw new Error('Please provide fault mandatory parameter for fault indication data');
  }

  let faultConfig = FI_DEFAULTS[fault];

  if (!faultConfig) {
    throw new Error(`Fault Indication map doesn't contain '${fault}'.
      Please provide '${fault}' fault indication for fault indication map`);
  }

  if (customConfig) {
    faultConfig = applyCustomConfig(faultConfig, customConfig);
  }

  if (!faultConfig.createdAt) {
    faultConfig.createdAt = new Date().toISOString();
  }

  validateFaultIndicationConfig(faultConfig);

  return {
    serviceName,
    ...faultConfig,
  };
}

export { getFaultIndication };
