import { schemaValidator } from '../utils/schemaValidator.js';

const PATH = Symbol('PATH');
const LOGGER = Symbol('LOGGER');
const CONFIG = Symbol('CONFIG');
const SCHEMA = Symbol('SCHEMA');
const DEFAULT_CONFIG = Symbol('DEFAULT_CONFIG');

function checkConfigPath() {
  const errorMsg = 'Path to the service frontend root must be provided';
  if (!this[PATH]) {
    if (this[LOGGER]) {
      this[LOGGER].error(errorMsg);
    } else {
      console.error(errorMsg);
    }
  }
}

/**
 * Class to access ui configuration API.
 *
 * @throws {Error} Errors may be thrown in case of improper initialization.
 */
class ConfigManager {
  /**
   * @param {object} options - Set of options.
   * @param {object} options.defaultConfig - Default configuration to fall back on if configuration
   * from the backend is not returned.
   * @param {object} options.schema - JSON schema to validate configs.
   * @param {object} [options.logger] - Instance of logger.
   * @param {string} [options.path] - Static path to the service frontend root.
   */
  constructor({ defaultConfig, schema, path, logger }) {
    if (!schema) {
      throw new Error('Validation schema must be provided');
    }
    const validationResult = schemaValidator.validateConfig(defaultConfig, schema);
    if (!validationResult.valid) {
      throw new Error('The default config does not comply to the validation schema');
    }
    this[DEFAULT_CONFIG] = defaultConfig;
    if (logger) {
      this[LOGGER] = logger;
    }
    if (path) {
      this[PATH] = path;
    }
    this[SCHEMA] = schema;
  }

  get config() {
    return this[CONFIG];
  }

  /**
   * Sets logger instance currently used by the class.
   *
   * @param {object} _logger - Instance of logger.
   */
  setLogger(_logger) {
    this[LOGGER] = _logger;
  }

  async getConfig() {
    if (this[CONFIG]) {
      return this[CONFIG];
    }
    return this.initConfig();
  }

  async readConfigFile() {
    checkConfigPath.call(this);
    const response = await fetch(`${this[PATH]}`);
    return response.json();
  }

  async initConfig() {
    let config;
    try {
      config = await this.readConfigFile();
      const validationResult = schemaValidator.validateConfig(config, this[SCHEMA]);
      if (!validationResult.valid) {
        const error = `Deployment config is invalid: ${validationResult.errors}`;
        if (this[LOGGER]) {
          this[LOGGER].error(error);
        } else {
          console.error(error);
        }
      } else {
        this[CONFIG] = config;
        return this[CONFIG];
      }
    } catch (e) {
      const errorText = `Reading deployment config failed: ${e.message}`;
      if (this[LOGGER]) {
        this[LOGGER].error(errorText);
      } else {
        console.error(errorText);
      }
    }
    return this[DEFAULT_CONFIG];
  }
}

export default ConfigManager;
