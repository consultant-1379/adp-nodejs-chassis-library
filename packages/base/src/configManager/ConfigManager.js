import * as fs from 'fs';
import lodash from 'lodash';
import { EventEmitter } from 'events';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import schemaValidator from '../utils/schemaValidator.js';
import { watchFile, stopFileWatch } from '../utils/fileHelper.js';

const { merge } = lodash;

/**
 * Supported file types.
 */
const fileTypes = Object.freeze({
  JSON: 'JSON',
  TEXT: 'TEXT',
});

/**
 * Checks if the provided file type is supported.
 *
 * @param {string} fileType - Type of the file to read and track, defined in ConfigManager.FILE_TYPES.
 *
 * @throws {Error}  Error indicating that the wrong file type was used.
 */
function checkFileType(fileType) {
  if (!Object.hasOwnProperty.call(fileTypes, fileType)) {
    throw new Error(`Unsupported type ${fileType}`);
  }
}

/**
 * Reads the file by its path. If file could not be read, emits event.
 * @private
 *
 * @param {string} jsonPath - Path to the file
 * @returns {Object|null}
 */
function readSafeJsonSync(jsonPath) {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch (error) {
    this.logger.error(`Error occurred reading ${jsonPath} config file: ${error.message}`);
    return null;
  }
}

/**
 * Reads the file by its path. If file could not be read, emits event.
 * @private
 *
 * @param {string} filePath - Path to the file
 * @returns {Object|null}
 */
function readSafePlainSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    this.logger.error(`Error occurred reading ${filePath} config file: ${error.message}`);
    return null;
  }
}

/**
 * Reads the file of given type by its path. If file could not be read, emits event.
 * @private
 *
 * @param {string} filePath - Path to the file
 * @param {string} fileType - type of the file to read and track, defined in ConfigManager.FILE_TYPES
 * @returns {Object|null}
 */
function readFileOfType(filePath, fileType) {
  const readers = {
    [fileTypes.JSON]: readSafeJsonSync,
    [fileTypes.TEXT]: readSafePlainSync,
  };
  return readers[fileType].call(this, filePath);
}

/**
 * Provides a default config value for a given file type.
 *
 * @param {string} fileType - Type of the file to read and track, defined in ConfigManager.FILE_TYPES.
 *
 * @returns {object|string}  Fallback default value, for a given file type, if defaultValue was not provided.
 */
function getDefaultValueForType(fileType) {
  const defaultValues = {
    [fileTypes.JSON]: {},
    [fileTypes.TEXT]: '',
  };
  return defaultValues[fileType];
}

/**
 * Creates a new configuration with a given name, if it hasn't been created yet.
 * @private
 *
 * @param {string} name - Config's name
 * @param {Object} defaultValue - Default value for the config
 * @param {string} fileType - type of the file to read and track, defined in ConfigManager.FILE_TYPES
 */
function createConfig(name, defaultValue, fileType) {
  if (!this.configMap.has(name)) {
    this.configMap.set(name, defaultValue ?? getDefaultValueForType(fileType)); // needed for backward compatibility
  }
}

/**
 * Sets a new value for the existing configuration.
 * @private
 *
 * @param {string} name - Config's name
 * @param {Object|string} configValue - New value for the config
 */
function setConfig(name, configValue) {
  if (this.configMap.has(name)) {
    this.configMap.set(name, configValue);
  }
}

/**
 * Contains application main config which updates with config json file.
 * In common use extends with application services configs.
 *
 * @extends EventEmitter
 */
class ConfigManager extends EventEmitter {
  static FILE_TYPES = fileTypes;

  /**
   * @param {object[]} configList - Configs parameters.
   * @param {string} configList[].name - The name of the config.
   * @param {string} configList[].filePath - Path to the file which will update the config.
   * @param {object} [configList[].schema] - Schema to validate the file.
   * @param {Array<object>} [configList[].additionalSchemaList] - Additional list of schemas referenced by the main schema.
   * @param {string} [configList[].defaultValue] - Config's default value.
   * @param {object} [logger] - Logger instance.
   */
  constructor(configList, logger) {
    super();
    this.configWatchMap = new Map();
    this.configMap = new Map();
    this.logger = getLogger(logger);
    if (configList?.length) {
      configList.forEach((configParams) => {
        this.startConfigWatch(configParams);
      });
    }
  }

  /**
   * Gets the configuration by its name. Returns an array if the configuration is an array.
   *
   * @param {string} configName - Configuration name.
   * @returns {object|undefined} Configuration object.
   */
  get(configName) {
    return this.configMap.get(configName);
  }

  /**
   * Watches for passed config file changes and updates config by its name.
   *
   * @param {object} options - Set of parameters.
   * @param {string} options.name - Config name.
   * @param {string} options.filePath - Config file path.
   * @param {object} [options.schema] - Schema to validate passed config file.
   * @param {Array<object>} [options.additionalSchemaList] - Additional list of schemas referenced by the main schema.
   * @param {object} [options.defaultValue] - Default config value. If needed, it passed only for a.
   * @param {string} [options.fileType] - Type of the file to read and track, defined in ConfigManager.FILE_TYPES
   * non-existent config, otherwise will be ignored.
   * @throws Will throw an error if passed configuration has already been watched.
   * @example
   * configManager.startConfigWatch({
   *   name: 'newConfig',
   *   filePath: 'configs/new-config.json',
   *   schema: schemaObject,
   *   additionalSchemaList: [otherSchemaObject, secondSchemaObject]
   *   defaultValue: {
   *     label: 'new',
   *   },
   *   fileType: ConfigManager.FILE_TYPES.JSON
   * });
   */
  startConfigWatch(options) {
    const { name, defaultValue, filePath, fileType = fileTypes.JSON } = options;
    checkFileType(fileType);
    if (this.configWatchMap.has(name)) {
      throw new Error(`Attempt to create a new config with existing name - ${name}`);
    }

    createConfig.call(this, name, defaultValue, fileType);

    this._updateConfig(options);
    const configWatch = watchFile(
      filePath,
      () => {
        this._updateConfig(options);
        this.emit('config-changed', { name, filePath });
      },
      this.logger,
    );
    this.configWatchMap.set(name, configWatch);
    this.emit('start-config-watch', name);
  }

  /**
   * Updates config by its name with passed file. If defaultValue was also passet,
   * it will update config as well, but the file has a higher priority.
   * @private
   *
   * @param {object} params - Set of parameters.
   * @param {string} params.name - Config name.
   * @param {string} params.filePath - Config file path.
   * @param {object} [params.schema] - Schema to validate passed config file.
   * @param {Array<object>} [params.additionalSchemaList] - Additional list of schemas referenced by the main schema
   * @param {object} [params.defaultValue] - Sets the default config value.
   * @param {string} [params.fileType] - type of the file to read and track, defined in ConfigManager.FILE_TYPES
   */
  _updateConfig(params) {
    const {
      name,
      filePath,
      schema,
      additionalSchemaList,
      defaultValue,
      fileType = fileTypes.JSON,
    } = params;
    checkFileType(fileType);
    const fileConfig = readFileOfType.call(this, filePath, fileType);
    if (!fileConfig) {
      return;
    }

    if (fileType === fileTypes.TEXT) {
      setConfig.call(this, name, fileConfig);
      return;
    }

    let config = this.get(name);
    let isFileConfigValid = true;
    let fileConfigValidation;

    if (schema) {
      fileConfigValidation = schemaValidator.validateConfig(
        fileConfig,
        schema,
        additionalSchemaList,
      );
      isFileConfigValid = fileConfigValidation.valid;
    }

    if (isFileConfigValid) {
      if (Array.isArray(fileConfig) && fileConfig.length) {
        config = [...fileConfig];
      } else if (Array.isArray(fileConfig) && !fileConfig.length) {
        config = [...defaultValue];
      } else {
        config = { ...config, ...merge({}, defaultValue ?? {}, fileConfig) };
      }
      setConfig.call(this, name, config);
    } else {
      this.logger.error(`Validation failed for ${name} config: ${fileConfigValidation.errors}`);
    }
  }

  /**
   * Stops monitoring changes in all configuration files and removes all event listeners.
   */
  stopAllConfigWatch() {
    this.configWatchMap.forEach(
      (configWatch) => configWatch && stopFileWatch(configWatch, this.logger),
    );
    this.configWatchMap.clear();
    this.removeAllListeners();
  }
}

export default ConfigManager;
