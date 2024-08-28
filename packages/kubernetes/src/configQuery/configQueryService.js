import { EventEmitter } from 'events';

import { networkUtil, getLogger } from '@adp/utilities';
import { wait } from '../utils/waitUtil.js';
import schemaValidator from '../utils/schemaValidator.js';
import { SERVICE_EVENTS, MAX_LOOP_ID } from '../constants.js';

const { normalizeURLEnding, normalizeURLSegment, fetchResponsesForProtocol } = networkUtil;

/**
 * Class to manage and store services configurations.
 *
 * @extends EventEmitter
 * @fires ConfigQueryService#service-config-updated When service configuration was updated.
 * @fires ConfigQueryService#service-config-deleted When deleting configuration after service has been removed.
 */

class ConfigQueryService extends EventEmitter {
  #options;

  #maxLoopId;

  #isPmService;

  #logger;

  #serviceConfigKeyDict;

  #numberConfigFetchTries;

  #configDict;

  #dst;

  /**
   * Configuration settings.
   *
   * @typedef {object} ConfigQueryItem
   * @property {string} configName - The name of the configuration.
   * @property {string} configFileName - The name of the configuration file.
   * @property {object} schema - Schema to validate the configuration.
   * @property {boolean} [allowEmptyConfig=false] - If an empty config-meta could be used.
   * @property {object} [configDefault] - For the case where config could be empty the default meta-value (must match the schema).
   * @property {Array<object>} [additionalSchemaList] - Additional schemas to validate the configuration.
   * @property {number} [limitOfTries=Infinity] - Maximum amount of tries to fetch the configuration.
   */

  /**
   * @param {object} options - Parameters.
   * @param {object} options.serviceCollection - ServiceCollection instance.
   * @param {object} options.certificateManager - CertificateManager instance.
   * @param {object} options.pmService - PmService instance.
   * @param {number} options.configFetchRetryPeriod - Number of ms used to calculate a time until the next try to fetch the configuration.
   * @param {number} options.configFetchMaxRetryPeriod - Maximum possible time in ms until the next try to fetch the configuration.
   * @param {string} options.internalUiName - Domain service name for mTLS internal communication.
   * @param {Array<ConfigQueryItem>} options.configQueryList - List of configurations.
   * @param {object} [options.logger] - Logger instance.
   * @param {object} [options.telemetryService] - Distributed System Tracing instance.
   * @param {number} [options.maxLoopId=1000] - Maximum number of simultaneous configuration requests.
   */
  constructor(options) {
    super();

    const { serviceCollection, logger, pmService, maxLoopId, telemetryService } = options;
    this.#options = options;
    this.#maxLoopId = maxLoopId || MAX_LOOP_ID;
    this.#isPmService = pmService && typeof pmService === 'object';
    this.#logger = getLogger(logger);
    this.#serviceConfigKeyDict = {};
    this.#numberConfigFetchTries = {};
    this.#configDict = {};
    this.#dst = telemetryService;
    this.#options.configQueryList.forEach(({ configName }) => {
      this.#configDict[configName] = {};
    });
    this.activeFetchLoops = {};

    if (this.#isPmService) {
      this.gauge = pmService.createMetric('gauge', {
        name: 'sum_of_retry_counters_of_in_progress_fetch_loops',
        help: 'The sum of retry counters of in-progress fetch loops.',
      });
    }

    serviceCollection.on(SERVICE_EVENTS.ADDED, (serviceWithUrl) => {
      logger.debug(`Adding service [${serviceWithUrl.name}] to configQueryService`);
      this.serviceHandler(serviceWithUrl);
    });
    serviceCollection.on(SERVICE_EVENTS.MODIFIED, (serviceWithUrl) => {
      logger.debug(`Updating configs for service [${serviceWithUrl.name}] in configQueryService`);
      this.serviceHandler(serviceWithUrl);
    });
    serviceCollection.on(SERVICE_EVENTS.DELETED, (service) => this.deleteService(service));
  }

  /**
   * Validates the configuration and saves it in the configQuery service.
   *
   * @param {object} config - Service configuration.
   * @param {object} serviceWithUrl - Service instance.
   * @param {object} configQuery - Configurations parameters.
   * @throws Throws an error if the config validation failed.
   */
  #handleConfig(config, serviceWithUrl, configQuery) {
    const {
      configName,
      configFileName,
      schema,
      additionalSchemaList,
      allowEmptyConfig = false,
      configDefault,
    } = configQuery;
    if (allowEmptyConfig && !config.meta) {
      config = {
        ...config,
        meta: configDefault,
      };
      this.#logger.warning(
        `${configFileName} not found for ${serviceWithUrl.name}. Using empty config.`,
      );
    }
    const result = schemaValidator.validateConfig(config.meta, schema, additionalSchemaList);
    if (!result.valid) {
      this.#logger.error(
        `Validation failed for ${serviceWithUrl.name}'s ${configFileName}: ${result.errors}`,
      );
      throw new Error(`Schema validation failed for ${serviceWithUrl.name} in ${configFileName}!`);
    }

    this.#configDict[configName][serviceWithUrl.name] = config;
    this.#logger.info(
      `Successfully applied config in ${configFileName} for ${serviceWithUrl.name}.`,
    );
    this.emit('service-config-updated', {
      configName,
      service: serviceWithUrl,
    });
  }

  /**
   * Fetches the service configuration.
   *
   * @param {object} serviceWithUrl - Service instance.
   * @param {string} configFileName - The name of the configuration file.
   * @returns {Promise<object>} Resolved promise with successfull or failed response on fetching the configuration.
   */
  async fetchConfig(serviceWithUrl, configFileName) {
    let successfulResponse;
    let failedResponse;
    let error;

    const { serviceurl, name, protocol } = serviceWithUrl;
    const { certificateManager, internalUiName } = this.#options;

    let { uiContentConfigContext } = serviceWithUrl;

    uiContentConfigContext = normalizeURLSegment(uiContentConfigContext);
    const url = `${normalizeURLEnding(serviceurl)}${uiContentConfigContext}${normalizeURLSegment(
      configFileName,
    )}`;

    this.#logger.info(`Fetching config from: ${url}, for service ${name}`);
    const dstService = this.#dst;
    try {
      // eslint-disable-next-line no-await-in-loop
      const serviceResponse = await fetchResponsesForProtocol({
        serviceName: internalUiName,
        protocol,
        url,
        certificateManager,
        dstService,
      });
      if (serviceResponse?.ok) {
        successfulResponse = serviceResponse;
      } else {
        failedResponse = serviceResponse;
      }
    } catch (err) {
      error = err;
    }

    return { successfulResponse, failedResponse, error };
  }

  #getNewLoopID(configKey) {
    const id = (this.activeFetchLoops[configKey] || 0) + 1;
    return id < this.#maxLoopId ? id : null;
  }

  /**
   * Creates and saves a unique key for a configuration file of a specific service. Also saves a
   * service name for tracking if it wasn't removed.
   *
   * @param {string} serviceName - The name of the configuration file.
   * @param {string} configFileName - Unique name for a configuration file of the specific service.
   * @returns {string} The unique key for the configuration file.
   */
  #createAndGetConfigKey(serviceName, configFileName) {
    const configKey = `${serviceName}_${configFileName}`;
    if (!this.#serviceConfigKeyDict[serviceName]) {
      this.#serviceConfigKeyDict[serviceName] = new Set();
    }
    this.#serviceConfigKeyDict[serviceName].add(configKey);
    return configKey;
  }

  #updateActiveFetchLoopsCounter() {
    if (this.#isPmService) {
      this.gauge.set(Object.keys(this.activeFetchLoops).length);
    }
  }

  /**
   * Tries to fetch the service configuration.
   *
   * @param {object} options - Parameters.
   * @param {object} options.serviceWithUrl - Service instance.
   * @param {string} options.configFileName - The name of the configuration file.
   * @param {number} [options.limitOfTries=Infinity] - Maximum amount of tries to fetch the configuration.
   * @param {string} options.configKey - Unique name for a configuration file of the specific service.
   * @returns {Promise<object>} Resolved promise with a service object that additionally contains configuration data.
   * @throws Will throw an error if a given service was removed.
   */
  async #fetchInLoop({ serviceWithUrl, configFileName, limitOfTries = Infinity, configKey }) {
    const { configFetchRetryPeriod, configFetchMaxRetryPeriod } = this.#options;
    const serviceName = serviceWithUrl.name;
    const loopID = this.#getNewLoopID(configKey);
    if (!loopID) {
      this.#logger.error('There are too many config fetch retry loops in progress');
      return undefined;
    }
    this.activeFetchLoops[configKey] = loopID;
    this.#updateActiveFetchLoopsCounter();

    let successfulResponse;
    let failedResponse;
    let error;
    let numberOfTries = 0; // all fetch requests
    let numberOfHTTPTries = 0; // fetch requests which didn't throw an exception, getting a valid HTTP response

    do {
      // The check builds on a shared context of the configQueryService instance. With the newer
      // request, while this loop is still running, this.activeFetchLoops will be changed while
      // loopID remains the same in the current scope
      if (
        !this.activeFetchLoops[configKey] || // the newer request was successful, and removed the entry for this service
        this.activeFetchLoops[configKey] > loopID // the newer request is also in progress with a higher loopID
      ) {
        this.#logger.debug(
          `Config has changed for service ${serviceName}, restarting config fetch loop`,
        );
        return undefined;
      }
      // eslint-disable-next-line no-await-in-loop
      ({ successfulResponse, failedResponse, error } = await this.fetchConfig(
        serviceWithUrl,
        configFileName,
      ));
      if (!(serviceName in this.#serviceConfigKeyDict)) {
        throw new Error(`Service "${serviceName}" removed`);
      }

      this.#numberConfigFetchTries[configKey] += 1;
      numberOfTries += 1;

      if (!successfulResponse?.ok) {
        if (failedResponse) {
          // error shouldn't increase this counter
          numberOfHTTPTries += 1;
        }

        const WAIT_BEFORE_RETRY = Math.min(
          configFetchRetryPeriod * 2 ** (numberOfTries - 1) + Math.floor(Math.random() * 1000),
          configFetchMaxRetryPeriod,
        );

        this.#logger.warning(
          `Fetching config failed ${
            this.#numberConfigFetchTries[configKey]
          } times for configuration ${configFileName} of ${serviceName} service with error: ${
            error?.message || failedResponse?.statusText
          }. Retrying in ${Math.floor(WAIT_BEFORE_RETRY / 1000)} seconds`,
        );

        // eslint-disable-next-line no-await-in-loop
        await wait(WAIT_BEFORE_RETRY);
      }
    } while (numberOfHTTPTries < limitOfTries && !successfulResponse?.ok);

    if (this.activeFetchLoops[configKey] === loopID) {
      // we should only touch the activeLoop map if we're still handling the most recent request
      delete this.activeFetchLoops[configKey];
      this.#numberConfigFetchTries[configKey] = 0;
    }

    this.#updateActiveFetchLoopsCounter();

    const meta = await successfulResponse?.json();
    return { ...serviceWithUrl, meta };
  }

  /**
   * Handles a given service configuration(s).
   *
   * @param {object} serviceWithUrl - Service instance.
   */
  async serviceHandler(serviceWithUrl) {
    try {
      const processConfig = async (configQuery) => {
        const { configFileName, limitOfTries } = configQuery;
        const configKey = this.#createAndGetConfigKey(serviceWithUrl.name, configFileName);
        if (!this.#numberConfigFetchTries[configKey]) {
          this.#numberConfigFetchTries[configKey] = 0;
        }
        const config = await this.#fetchInLoop({
          serviceWithUrl,
          configFileName,
          limitOfTries,
          configKey,
        });
        if (!config) {
          // fetch loop was abandoned due to service update
          return;
        }
        this.#handleConfig(config, serviceWithUrl, configQuery);
      };

      await Promise.all(this.#options.configQueryList.map(processConfig));
    } catch (err) {
      this.deleteService(serviceWithUrl);
      this.#logger.info(
        `Failing service ${serviceWithUrl.name} was removed from configQueryService. [Error: ${err.message}]`,
      );
    }
  }

  /**
   * For all handled services it returns the specific configuration by its name.
   *
   * @param {string} configName - The name of configuration.
   * @returns {object} Configurations.
   */
  getConfig(configName) {
    return this.#configDict[configName];
  }

  /**
   * Clear configuration data about deleted service.
   *
   * @param {object} service - Service instance.
   */
  deleteService(service) {
    this.#logger.info(`Removing service [${service.name}] from configQueryService`);

    if (service.name in this.#serviceConfigKeyDict) {
      this.#options.configQueryList.forEach(({ configName }) => {
        delete this.#configDict[configName][service.name];
      });
      this.#serviceConfigKeyDict[service.name].forEach((configKey) => {
        delete this.activeFetchLoops[configKey];
        delete this.#numberConfigFetchTries[configKey];
      });
      delete this.#serviceConfigKeyDict[service.name];
      this.emit('service-config-deleted', { service });
    } else {
      this.#logger.debug(
        `Cannot delete [${service.name}]. Service [${service.name}] is not in the configuration.`,
      );
    }
  }
}

export default ConfigQueryService;
