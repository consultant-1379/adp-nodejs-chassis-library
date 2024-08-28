import { EventEmitter } from 'events';

const UI_CONFIG = 'ui-config';

/**
 * Contains additional config
 * to be provided as configs to the front-end,
 * which updates with config json file.
 *
 * @extends EventEmitter
 * @fires UiConfigService#ui-config-changed
 */
class UiConfigService extends EventEmitter {
  /**
   * Creates UI service.
   *
   * @param {object} options - Set of options.
   * @param {string} options.configFilePath - Path to the configuration file.
   * @param {object} options.configManager - Instance of the existing `configManager`.
   * @param {object} [options.defaultValue] - Default value for the config.
   * @param {object} [options.configObject] - Object with optional constant configuration, can also
   * be used to set default values.
   */
  constructor(options) {
    super();
    const { configFilePath, configManager, defaultValue, configObject = {} } = options || {};
    const config = {
      name: UI_CONFIG,
    };
    if (configFilePath) {
      config.filePath = configFilePath;
    } else {
      throw new Error('Config file path must be provided');
    }

    if (defaultValue) {
      config.defaultValue = defaultValue;
    }

    if (configManager) {
      this.configManager = configManager;
      this.configManager.startConfigWatch(config);
    } else {
      throw new Error('Config manager must be provided');
    }
    this.uiConfig = {};
    this.configObject = configObject;
    this.updateUIConfig();

    configManager.on('config-changed', ({ name }) => {
      if (name === UI_CONFIG) {
        this.updateUIConfig();
        this.emit('ui-config-changed');
      }
    });
  }

  /**
   * Updates UI config with current values from the `configManager`.
   */
  updateUIConfig() {
    this.uiConfig = {
      ...this.configObject,
      ...this.configManager.get(UI_CONFIG),
    };
  }

  /**
   * Returns current UI config.
   *
   * @returns {object} UI config.
   */
  getUIConfig() {
    return this.uiConfig;
  }

  /**
   * Creates middleware which returns UI config.
   *
   * @returns {Function} Middleware function.
   */
  getUIConfigMiddleware() {
    return (_req, res) => {
      res.json(this.getUIConfig());
      res.end();
    };
  }
}

export default UiConfigService;
