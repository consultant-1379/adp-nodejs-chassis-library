import { EventEmitter } from 'events';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import schemaValidator from '../utils/schemaValidator.js';
import { SERVICE_EVENTS } from '../constants.js';

/**
 * Class to manage and store manual service configs.
 *
 * @extends EventEmitter
 * @fires ManualServiceConfigHandler#service-added When a service was added.
 * @fires ManualServiceConfigHandler#service-modified When a service was modified.
 * @fires ManualServiceConfigHandler#service-deleted When a service was removed.
 */
class ManualServiceConfigHandler extends EventEmitter {
  #logger;

  /**
   * @param {object} options - Parameters.
   * @param {object} options.serviceConfigList - Configuration for the manual services.
   * @param {string} [options.logger] - Logger instance.
   */
  constructor(options) {
    super();

    const { logger, serviceConfigList } = options;
    this.#logger = getLogger(logger);
    this.manualServiceConfig = this.#getServiceConfig(serviceConfigList);
  }

  /**
   * Returns modified array of services configurations.
   *
   * @param {Array<object>} [serviceConfigList=[]] - Configuration list.
   * @returns {Array<object>} Service configurations.
   */
  #getServiceConfig(serviceConfigList = []) {
    const result = schemaValidator.validateManualServiceConfig(serviceConfigList);
    if (!result.valid) {
      this.#logger.error(
        `Validation failed for Manual Service Config with error: ${result.errors}`,
      );
      return [];
    }
    return serviceConfigList.map((service) => {
      const url = new URL(service.URL);
      return {
        name: service.name,
        version: service.version,
        protocol: url.protocol.slice(0, -1),
        ingressBaseurl: url.href,
        serviceurl: url.host,
        uiContentConfigContext: url.pathname,
      };
    });
  }

  /**
   * Updates the list of configuration.
   *
   * @param {Array<object>} serviceConfigList - Configuration list.
   */
  handleServiceConfigChange(serviceConfigList) {
    const updatedConfig = this.#getServiceConfig(serviceConfigList);

    this.manualServiceConfig.forEach((service) => {
      if (!updatedConfig.find(({ name }) => name === service.name)) {
        this.emit(SERVICE_EVENTS.DELETED, service);
      }
    });

    updatedConfig.forEach((service) => {
      const previousService = this.manualServiceConfig.find(({ name }) => name === service.name);
      if (previousService) {
        if (previousService.version !== service.version) {
          this.emit(SERVICE_EVENTS.MODIFIED, service);
        }
      } else {
        this.emit(SERVICE_EVENTS.ADDED, service);
      }
    });

    this.manualServiceConfig = updatedConfig;
  }

  /**
   * Manually triggers `service-added` event for all services.
   */
  triggerInitialEvents() {
    this.manualServiceConfig.forEach((service) => this.emit(SERVICE_EVENTS.ADDED, service));
  }
}

export default ManualServiceConfigHandler;
