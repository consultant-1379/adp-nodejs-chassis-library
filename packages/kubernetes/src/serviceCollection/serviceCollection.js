import { EventEmitter } from 'events';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import { SERVICE_EVENTS } from '../constants.js';

/**
 * Class to store and manage collection of services.
 *
 * @extends EventEmitter
 * @fires ServiceCollection#service-added When a service is added to the collection.
 * @fires ServiceCollection#service-modified When a service has been modified.
 * @fires ServiceCollection#service-deleted When a service is removed from the collection.
 */
class ServiceCollection extends EventEmitter {
  #logger;

  /**
   * @param {object} [logger] - Logger instance.
   */
  constructor(logger) {
    super();
    this.services = [];
    this.#logger = getLogger(logger);
  }

  /**
   * @private
   * @param {object} service
   * @returns {string} UID
   */
  getServiceUID(service) {
    const appName = service.name ?? 'unknownApp';
    const appVersion = service.version ?? '0.0.0';
    const uid = `${appName}-${appVersion}`;
    return uid.replace(/\s|\+/g, '_');
  }

  /**
   * Adds the service if it isn't in the collection.
   *
   * @param {object} service - Service instance.
   */
  addService(service) {
    service.uid = this.getServiceUID(service);
    if (!this.services.some((s) => s.name === service.name)) {
      this.services.push(service);
      this.emit(SERVICE_EVENTS.ADDED, service);

      this.#logger.debug(
        `Service Collection ADD Event: ${service.name} is added: ${JSON.stringify(service)}`,
      );
    } else {
      this.#logger.debug(
        `Service Collection ADD Event: ${service.name} already exists in collection, skipping to add again`,
      );
    }
  }

  /**
   * Modifies a given service if it exists in the collection.
   *
   * @param {object} service - Service instance.
   */
  modifyService(service) {
    service.uid = this.getServiceUID(service);
    const index = this.services.findIndex((s) => s.name === service.name);
    if (index > -1) {
      this.services[index] = service;
      this.emit(SERVICE_EVENTS.MODIFIED, service);

      this.#logger.debug(
        `Service Collection MODIFY Event: ${service.name} is modified: ${JSON.stringify(service)}`,
      );
    } else {
      this.#logger.warning(
        `Service Collection MODIFY Event: ${service.name} is missing from collection`,
      );
    }
  }

  /**
   * Deletes a given service if it exists in the collection.
   *
   * @param {object} service - Service instance.
   */
  deleteService(service) {
    const index = this.services.findIndex((s) => s.name === service.name);
    if (index > -1) {
      const [deletedService] = this.services.splice(index, 1);
      this.emit(SERVICE_EVENTS.DELETED, deletedService);

      this.#logger.debug(
        `Service Collection DELETE Event: ${deletedService.name} is deleted: ${JSON.stringify(
          deletedService,
        )}`,
      );
    } else {
      this.#logger.warning(
        `Service Collection DELETE Event: ${service.name} is missing from collection`,
      );
    }
  }

  /**
   * Returns the whole collection.
   *
   * @returns {Array<object>} Collection.
   */
  getServices() {
    return this.services.map((service) => ({ ...service }));
  }

  /**
   * Emits service-modified event if a service with the given name exists in the collection.
   *
   * @param {string} serviceName - The name of a service.
   * @returns {true|false} If service exists in the collection, then true, otherwise false.
   */
  forceUpdateService(serviceName) {
    const service = this.services.find((s) => s.name === serviceName);
    if (service) {
      this.emit(SERVICE_EVENTS.MODIFIED, service);

      this.#logger.debug(
        `Service Collection MODIFY Event: ${service.name} is modified: ${JSON.stringify(service)}`,
      );
      return true;
    }
    this.#logger.debug(
      `Invalid request to update: ${serviceName}. No service present with this name.`,
    );
    return false;
  }
}

export default ServiceCollection;

export { SERVICE_EVENTS };
