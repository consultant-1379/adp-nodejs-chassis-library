import k8s from '@kubernetes/client-node';
import { existsSync, readFileSync } from 'fs';
// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import * as events from 'events';
import lodash from 'lodash';
import K8sResourceMetric from '../metrics/k8sResourceMetric.js';
import { wait } from '../utils/waitUtil.js';

import {
  RESOURCE_CHANGE_TYPE,
  RESOURCE_TYPE,
  SERVICE_EVENTS,
  DEFAULT_CONFIGS,
  DEFAULT_UI_CONTEXT,
} from '../constants.js';

const { isMatch } = lodash;
const LOGGER = Symbol('LOGGER');
const FM = Symbol('FM');
const PM = Symbol('Performance Management Service');

const DEFAULT_NAMESPACE = 'default';

// Used only in local bridge mode.
const loadBridgeConfig = (kc, config, token) => {
  kc.loadFromClusterAndUser(
    {
      name: 'cluster',
      skipTLSVerify: true, // the server certificates will be invalid as the local tunneled ip is different from the actual one
      server: `https://${config.kubernetesServiceHost}:${config.kubernetesServicePort}`,
    },
    {
      name: 'serviceaccount',
      authProvider: {
        name: 'tokenFile',
        config: {
          tokenFile: token,
        },
      },
    },
  );
};

/**
 * Class supporting Kubernetes API operations.
 *
 * @extends events.EventEmitter
 * @param {object} options - Collection of parameters.
 * @param {k8sConfig} options.k8sConfig - Main configuration.
 * @param {object} options.logger - This logger is used for warnings, errors.
 * @param {object} options.fMHandler - Needed for creating fault indications.
 * @param {object} options.pmService - Needed for collecting performance metrics.
 * Structure of the main configuration.
 * @typedef {object} k8sConfig
 * @property {string} labelName - Stores the workspace name.
 * @property {string} labelValue - Workspace label.
 * @property {object} configFetch - This object stores the config fetching options.
 * @property {string} queryProtocolAnnotation - Used for calculating the protocol for fetching.
 * @property {string} queryPortAnnotation - Used for calculating the needed port for fetching.
 * @property {string} uiContentConfigContextAnnotation - The context used for fetching.
 * @property {object} extraAnnotations - List (as object properties) of additional annotations,
 * the values of which need to be added to the mapped service parameters, in the following format:
 * [service parameter] : [{String} source annotation].
 * @property {string} appNameLabel - Name of the fetched app.
 * @property {string} appVersionLabel - Version of the app.
 * @property {boolean} discoverIngress - If set, ingress is enabled.
 * @property {number} ingressTlsPort - Ingress TLS port.
 * @property {number} ingressHttpPort - Ingress HTTP port.
 * @property {string} serviceAccountDir - Kubernetes service account, needed for the namespace, tokens.
 * @property {boolean} useHttps - Setting of tls (true = https, false = http).
 * Used if queryProtocolAnnotation is not given.
 */
class K8sQueryService extends events.EventEmitter {
  constructor(options) {
    super();
    const { k8sConfig, logger, fMHandler, pmService } = options;

    this.k8sConfig = Object.assign(DEFAULT_CONFIGS, k8sConfig);

    const NAMESPACE_FILE = `${this.k8sConfig.serviceAccountDir}/namespace`;
    const TOKEN_FILE = `${this.k8sConfig.serviceAccountDir}/token`;

    this[FM] = fMHandler;
    this[PM] = pmService;

    this[LOGGER] = getLogger(logger);

    if (existsSync(NAMESPACE_FILE)) {
      this.namespace = readFileSync(NAMESPACE_FILE, 'utf8');
    } else {
      this.namespace = DEFAULT_NAMESPACE;
    }
    const kc = new k8s.KubeConfig();

    if (this.k8sConfig.nodeEnvironment === 'bridge') {
      loadBridgeConfig(kc, this.k8sConfig.bridge, TOKEN_FILE);
    } else {
      kc.loadFromDefault();
    }

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.k8sIngressApi = kc.makeApiClient(k8s.NetworkingV1Api);
    this.k8sWatch = new k8s.Watch(kc);
    this.serviceSelectors = {};
    this.endpoints = {};
  }

  #createMetric() {
    const serviceMetric = new K8sResourceMetric({
      resourceType: RESOURCE_TYPE.SERVICE,
      logger: this[LOGGER],
      pm: this[PM],
    });
    const podMetric = new K8sResourceMetric({
      resourceType: RESOURCE_TYPE.POD,
      logger: this[LOGGER],
      pm: this[PM],
    });
    const endpointMetric = new K8sResourceMetric({
      resourceType: RESOURCE_TYPE.ENDPOINT,
      logger: this[LOGGER],
      pm: this[PM],
    });

    serviceMetric.on('remove-metric-resource', (serviceName) => {
      podMetric.removeByServiceName(serviceName);
    });

    this._resourcesMetric = {
      [RESOURCE_TYPE.SERVICE]: serviceMetric,
      [RESOURCE_TYPE.POD]: podMetric,
      [RESOURCE_TYPE.ENDPOINT]: endpointMetric,
    };
  }

  #removeMetric() {
    this._resourcesMetric[RESOURCE_TYPE.SERVICE].clear();
    this._resourcesMetric[RESOURCE_TYPE.POD].clear();
    this._resourcesMetric[RESOURCE_TYPE.ENDPOINT].clear();

    delete this._resourcesMetric;
  }

  /**
   * Starts the k8 cluster watching. Initializes Service, Pod and Endpoint watch logic, and also metrics.
   */
  async startWatching() {
    this[LOGGER].info(`K8S service will start watching the ${this.namespace} namespace.`);

    this.#createMetric();

    await this.initServiceWatch();
    await this.initEndpointWatch();
    await this.initPodWatch();
  }

  async initEndpointWatch() {
    this.endpointWatchRequest = await this.k8sWatch.watch(
      `/api/v1/namespaces/${this.namespace}/endpoints`,
      {
        allowWatchBookmarks: false,
      },
      async (type, endpointObject) => {
        await this.endpointHandler(type, endpointObject);
      },
      async (err) => {
        await this.endpointErrorHandler(err);
      },
    );
  }

  async endpointHandler(type, endpointObject) {
    const endpointName = endpointObject.metadata.name;
    const isEndpointRelevant = await this.isEndpointRelevant(endpointName);

    if (isEndpointRelevant) {
      this[LOGGER].info(`K8S: Endpoint event: [${type}] on object: ${endpointName}.`);
    } else {
      this[LOGGER].debug(
        `K8S: Endpoint event: [${type}] on object: ${endpointName}, but endpoint is not relevant.`,
      );
    }

    if (type === RESOURCE_CHANGE_TYPE.DELETE) {
      delete this.endpoints[endpointName];
      this._resourcesMetric[RESOURCE_TYPE.ENDPOINT].remove(endpointName);
    } else if (isEndpointRelevant) {
      let endpointAddresses = [];
      if (endpointObject?.subsets && Array.isArray(endpointObject?.subsets)) {
        endpointAddresses = endpointObject.subsets[0]?.addresses || [];
      }
      this.endpoints[endpointName] = endpointAddresses;
      this._resourcesMetric[RESOURCE_TYPE.ENDPOINT].add(endpointName, undefined);
    }

    if (type === RESOURCE_CHANGE_TYPE.DELETE || isEndpointRelevant) {
      // recalculate pods
      this._resourcesMetric[RESOURCE_TYPE.POD].reset();

      Object.keys(this.endpoints).forEach((key) => {
        this.endpoints[key].forEach((endpointAddress) => {
          this._resourcesMetric[RESOURCE_TYPE.POD].update({
            type: RESOURCE_CHANGE_TYPE.ADD,
            name: endpointAddress.ip,
            serviceName: key,
          });
        });
      });
    }
  }

  async endpointErrorHandler(err) {
    // connection was closed
    if (err === null) {
      this[LOGGER].debug('Endpoint watch connection was closed. Re-establashing watch connection.');
      this.endpointWatchRequest.abort();
      await this.initEndpointWatch();
    } else {
      this[FM]?.produceFaultIndication({
        fault: 'K8S_ERROR',
        customConfig: {
          description: `Error occurred during endpoint watch: ${err?.message ?? err} Retrying in ${
            this.k8sConfig.watchReconnectInterval
          } seconds`,
        },
      });
      this[LOGGER].error(
        `Error occurred during endpoint watch: ${err?.message ?? err} Retrying in ${
          this.k8sConfig.watchReconnectInterval
        } seconds`,
      );
      setTimeout(async () => {
        this.endpointWatchRequest.abort();
        await this.initEndpointWatch();
      }, this.k8sConfig.watchReconnectInterval * 1000);
    }
  }

  async initServiceWatch() {
    this.servicesWatchRequest = await this.k8sWatch.watch(
      `/api/v1/namespaces/${this.namespace}/services`,
      {
        allowWatchBookmarks: false,
      },
      async (type, serviceObject) => {
        await this.serviceHandler(type, serviceObject);
      },
      async (err) => {
        await this.serviceErrorHandler(err);
      },
    );
  }

  async serviceHandler(type, serviceObject) {
    const service = this.mapService(serviceObject);
    if (!this.isServiceRelevant(serviceObject)) {
      if (
        type === RESOURCE_CHANGE_TYPE.MODIFY &&
        serviceObject.metadata.name in this.serviceSelectors &&
        isMatch(serviceObject.spec.selector, this.serviceSelectors[serviceObject.metadata.name])
      ) {
        delete this.serviceSelectors[service.name];
        const serviceWithBaseUrl = await this.calculateBaseUrl(service);

        this[LOGGER].info(
          `K8S: Service event: [${type}] on object: ${JSON.stringify(
            serviceWithBaseUrl,
          )}, became irrelevant, deleting...`,
        );

        this.emit(SERVICE_EVENTS.DELETED, serviceWithBaseUrl);
        this._resourcesMetric[RESOURCE_TYPE.SERVICE].remove(service.name);
      }
      return;
    }

    if (this.isServiceRelevant(serviceObject) && service.port === undefined) {
      const serviceWithBaseUrl = await this.calculateBaseUrl(service);
      this[LOGGER].warning(
        `K8S: Service event: [${type}] on object: ${JSON.stringify(
          serviceWithBaseUrl,
        )}, doesn't have port definition skipping processing it`,
      );
      return;
    }

    this[LOGGER].info(`K8S: Service event: [${type}] on object: ${JSON.stringify(service)}`);
    if (type === RESOURCE_CHANGE_TYPE.DELETE) {
      delete this.serviceSelectors[service.name];

      const serviceWithBaseUrl = await this.calculateBaseUrl(service);
      this.emit(SERVICE_EVENTS.DELETED, serviceWithBaseUrl);

      this._resourcesMetric[RESOURCE_TYPE.SERVICE].remove(service.name);
      return;
    }

    if (!this.serviceSelectors[service.name]) {
      type = RESOURCE_CHANGE_TYPE.ADD;
    }

    try {
      this.serviceSelectors[service.name] = serviceObject.spec.selector;
      await this.waitForPodStartup(service.name);
      const serviceWithBaseUrl = await this.calculateBaseUrl(service);

      if (type === RESOURCE_CHANGE_TYPE.ADD) {
        this.emit(SERVICE_EVENTS.ADDED, serviceWithBaseUrl);
      }
      if (type === RESOURCE_CHANGE_TYPE.MODIFY) {
        this.emit(SERVICE_EVENTS.MODIFIED, serviceWithBaseUrl);
      }
      this._resourcesMetric[RESOURCE_TYPE.SERVICE].add(service.name, undefined);
    } catch (e) {
      this[LOGGER].error(
        `${e.name} occurred for service ${service.name} when fetching configuration changes from Kubernetes API: ${e.message}.`,
      );
      this[LOGGER].debug(JSON.stringify(e));
    }
  }

  async serviceErrorHandler(err) {
    // connection was closed
    if (err === null) {
      this[LOGGER].debug('Service watch connection was closed. Re-establishing watch connection.');
      this.servicesWatchRequest.abort();
      await this.initServiceWatch();
    } else {
      this[FM]?.produceFaultIndication({
        fault: 'K8S_ERROR',
        customConfig: {
          description: `Error occurred during service watch: ${err?.message ?? err} Retrying in ${
            this.k8sConfig.watchReconnectInterval
          } seconds`,
        },
      });
      this[LOGGER].error(
        `Error occurred during service watch: ${err?.message ?? err} Retrying in ${
          this.k8sConfig.watchReconnectInterval
        } seconds`,
      );
      setTimeout(async () => {
        this.servicesWatchRequest.abort();
        await this.initServiceWatch();
      }, this.k8sConfig.watchReconnectInterval * 1000);
    }
  }

  async waitForPodStartup(serviceName) {
    // @ts-ignore
    if (!this.endpoints[serviceName]?.length >= 1) {
      this[LOGGER].info(`Waiting for pods of service "${serviceName}" to start up...`);
    }
    /* eslint-disable no-await-in-loop */
    let waitTime = 0;
    // @ts-ignore
    while (!this.endpoints[serviceName]?.length >= 1 && this.serviceSelectors[serviceName]) {
      await wait(this.k8sConfig.podStartupTimeout);
      waitTime += 1;
      if (waitTime % 10 === 0) {
        this[LOGGER].debug(
          `Waiting for pods of service "${serviceName}". Elapsed time: ${
            waitTime * this.k8sConfig.podStartupTimeout
          }`,
        );
      }
    }
    if (!this.serviceSelectors[serviceName]) {
      throw new Error(`Service "${serviceName}" is removed while waiting for Pod to start!`);
    }
  }

  /**
   * Waits for pod termination.
   *
   * @private
   * @param {string} podName - name of the pod which is terminating.
   */
  async waitForPodTermination(podName) {
    let isPodTerminated = false;
    /* eslint-disable no-await-in-loop */
    let waitTime = 0;
    this[LOGGER].info(`Waiting for pod ${podName} termination...`);
    // @ts-ignore
    while (!isPodTerminated) {
      await wait(this.k8sConfig.podTerminationTimeout);
      waitTime += 1;
      const notTerminatedPod = await this.getPodObject(podName);

      isPodTerminated = !notTerminatedPod;
      if (waitTime % 10 === 0) {
        this[LOGGER].debug(
          `Waiting for pod "${podName}" termination. Elapsed time: ${
            waitTime * this.k8sConfig.podTerminationTimeout
          }`,
        );
      }
    }
  }

  /**
   * Waits for pod termination and after check if new pod replica created.
   * If new pod replica created then wait for pod startup.
   *
   * @private
   * @param {string} podName - name of the pod which is terminating.
   * @param {string} generatePodName - immutable part of pod name.
   * @param {string} serviceName - name of the service which contains the pod.
   */
  async waitPodReplicaCreation(podName, generatePodName, serviceName) {
    const terminatedPod = await this.getPodObject(podName);
    if (terminatedPod) {
      await this.waitForPodTermination(podName);
    }
    await wait(this.k8sConfig.podReplicaStartupTimeout);
    const namespacedPods = await this.getNamespacedPods();
    const isReplicaPodInit = namespacedPods?.some(
      (currentPod) => currentPod.metadata.generateName === generatePodName,
    );
    if (isReplicaPodInit) {
      await this.waitForPodStartup(serviceName);
    }
  }

  async initPodWatch() {
    this.podsWatchRequest = await this.k8sWatch.watch(
      `/api/v1/namespaces/${this.namespace}/pods`,
      {
        allowWatchBookmarks: false,
      },
      async (type, pod) => {
        await this.podHandler(type, pod);
      },
      async (err) => {
        await this.podErrorHandler(err);
      },
    );
  }

  async podHandler(type, pod) {
    const serviceName = this.getServiceNameForPod(pod?.metadata?.labels);
    if (!serviceName) {
      return;
    }

    const serviceObject = await this.getServiceObject(serviceName);
    if (!serviceObject) {
      this[LOGGER].info(
        `K8S: POD event: [${type}] on pod: ${pod?.metadata?.name}. Service ["${serviceName}"] is not found in namespace`,
      );
      return;
    }

    if (!this.isServiceRelevant(serviceObject)) {
      return;
    }

    const serviceWithBaseUrl = await this.getServiceWithBaseUrl(serviceObject);
    if (!serviceWithBaseUrl) {
      return;
    }

    this[LOGGER].info(`K8S: POD event: [${type}] on object: ${JSON.stringify(serviceWithBaseUrl)}`);

    if (type === RESOURCE_CHANGE_TYPE.MODIFY) {
      this.emit(SERVICE_EVENTS.MODIFIED, serviceWithBaseUrl);
    }

    if (type === RESOURCE_CHANGE_TYPE.DELETE) {
      const podMetadata = pod?.metadata;
      const { name: terminatedPodName, generateName: generatePodName } = podMetadata;
      await this.waitPodReplicaCreation(terminatedPodName, generatePodName, serviceName);
    }

    if (
      type === RESOURCE_CHANGE_TYPE.DELETE &&
      !this.endpoints[serviceName]?.length &&
      this.serviceSelectors[serviceName]
    ) {
      // the service remains while the pod is down and endpoints are removed
      this.emit(SERVICE_EVENTS.DELETED, serviceWithBaseUrl);
    }
  }

  async podErrorHandler(err) {
    // connection was closed
    if (err === null) {
      this[LOGGER].debug('Pod watch connection was closed. Re-establishing watch connection.');
      this.podsWatchRequest.abort();
      await this.initPodWatch();
    } else {
      this[FM]?.produceFaultIndication({
        fault: 'K8S_ERROR',
        customConfig: {
          description: `Error occurred during pod watch: ${err?.message ?? err} Retrying in ${
            this.k8sConfig.watchReconnectInterval
          } seconds`,
        },
      });
      this[LOGGER].error(
        `Error occurred during pod watch: ${err?.message ?? err} Retrying in ${
          this.k8sConfig.watchReconnectInterval
        } seconds`,
      );
      setTimeout(async () => {
        this.podsWatchRequest.abort();
        await this.initPodWatch();
      }, this.k8sConfig.watchReconnectInterval * 1000);
    }
  }

  /**
   * Stops the k8s cluster watch, aborts the current requests, and metrics.
   */
  stopWatching() {
    this.servicesWatchRequest.abort();
    this.podsWatchRequest.abort();
    this.#removeMetric();
  }

  isServiceRelevant(serviceObject) {
    const label = this.k8sConfig.labelName;
    const value = this.k8sConfig.labelValue;
    return serviceObject.metadata?.labels?.[label] === value;
  }

  async isEndpointRelevant(endpointName) {
    const serviceObject = await this.getServiceObject(endpointName);
    return !!serviceObject && this.isServiceRelevant(serviceObject);
  }

  /**
   * Returns service object from service name.
   * @private
   * @param {string} serviceName - Name of the k8 service.
   * @returns {Promise<object>} Body of the found k8 service object.
   */
  async getServiceObject(serviceName) {
    let serviceObject;
    try {
      serviceObject = await this.k8sApi.readNamespacedService(serviceName, this.namespace);
    } catch (e) {
      // 404 - Service doesn't exist - a normal case
      if (e.response?.statusCode === 404) {
        this[LOGGER].debug(`Service ["${serviceName}"] is not found by K8S API.`);
      } else {
        this[LOGGER].error(
          `Error when fetching Service object "${serviceName}" from K8S API. [${
            e.response?.statusCode || e
          }: ${e.response?.statusMessage || ''}]`,
        );
        await this.coreV1ErrorHandler(e);
      }
    }
    return serviceObject?.body;
  }

  /**
   * Returns pod object from pod name.
   * @private
   * @param {string} podName - Name of the k8 pod.
   * @returns {Promise<object>} Body of the found k8 pod object.
   */
  async getPodObject(podName) {
    let podObject;
    try {
      podObject = await this.k8sApi.readNamespacedPod(podName, this.namespace);
    } catch (e) {
      // 404 - Pod doesn't exist - a normal case
      if (e.response?.statusCode === 404) {
        this[LOGGER].debug(`Pod ["${podName}"] is not found by K8S API.`);
      } else {
        this[LOGGER].error(
          `Error when fetching Pod object "${podName}" from K8S API. [${
            e.response?.statusCode || e
          }: ${e.response?.statusMessage || ''}]`,
        );
        await this.coreV1ErrorHandler(e);
      }
    }
    return podObject?.body;
  }

  /**
   * Returns list of namespaced pods
   * @private
   * @returns {Promise<object>} Body of the found k8 pods objects.
   */
  async getNamespacedPods() {
    let podObjects;
    try {
      podObjects = await this.k8sApi.listNamespacedPod(this.namespace);
    } catch (e) {
      // 404 - Pod doesn't exist - a normal case
      if (e.response?.statusCode === 404) {
        this[LOGGER].debug(`Namespaced Pods are not found by K8S API.`);
      } else {
        this[LOGGER].error(
          `Error when fetching namespaces Pods from K8S API. [${e.response?.statusCode || e}: ${
            e.response?.statusMessage || ''
          }]`,
        );
        await this.coreV1ErrorHandler(e);
      }
    }
    return podObjects?.body?.items;
  }

  async getServiceWithBaseUrl(serviceObject) {
    return this.calculateBaseUrl(this.mapService(serviceObject));
  }

  getServiceNameForPod(labels) {
    const selector = Object.entries(this.serviceSelectors).find((serviceSelector) =>
      isMatch(labels, serviceSelector[1]),
    );
    if (selector) {
      return selector[0];
    }
    return null;
  }

  /**
   * Query the Ingress resources and build a service -> path map. It can be used to query a service
   * from outside of Kubernetes.
   *
   * Note: this method only returns the configured path which can be a wildcarded URL at some Ingress resource.
   * @private
   * @param {object} parameters - Object containing parameters.
   * @param {string} parameters.namespace - The K8s namespace to fetch service from.
   * @returns {Promise<object>} ServiceIngressMap A key-value map where the key is servicename:port and the value is ingress.path.
   * @memberof K8sService
   */
  async requestIngressMap({ namespace }) {
    try {
      const ingress = await this.k8sIngressApi.listNamespacedIngress(namespace);
      const pathServiceList = ingress.body.items.map((item) => {
        const { spec } = item;
        if (spec.tls) {
          return spec.tls.map((rule) =>
            rule.hosts.map((host) => ({
              secretName: rule.secretName,
              host,
              port: this.k8sConfig.ingressTlsPort,
            })),
          );
        }
        return item.spec.rules.map((rule) =>
          rule.http.paths.map((path) => ({
            host: rule.host,
            path: path.path,
            port: this.k8sConfig.ingressHttpPort,
            ...path.backend,
          })),
        );
      });

      // @ts-ignore
      const pathServiceListFlat = pathServiceList.flat(2);

      // @ts-ignore
      return Object.fromEntries(
        pathServiceListFlat.map((rule) => {
          // @ts-ignore
          const entry = [`${rule.serviceName}:${rule.servicePort}`];
          if (this.k8sConfig.discoverIngress) {
            // @ts-ignore
            entry.push({
              ingressHost: rule.host,
              ingressPort: rule.port,
              // @ts-ignore
              ingressPath: rule.path ? rule.path.replace('(/|$)(.*)', '') : '',
            });
          }
          return entry;
        }),
      );
    } catch (err) {
      await this.ingressErrorHandler(err);
      return {};
    }
  }

  async ingressErrorHandler(err) {
    this[FM]?.produceFaultIndication({
      fault: 'K8S_ERROR',
      customConfig: {
        description: `Error occurred during ingress map fetch: ${err?.message ?? err}`,
      },
    });
    this[LOGGER].error(`Error occurred during ingress map fetch: ${err?.message ?? err}`);
  }

  async coreV1ErrorHandler(err) {
    this[FM]?.produceFaultIndication({
      fault: 'K8S_ERROR',
      customConfig: {
        description: `Error occurred during CoreV1 API call: ${err?.message ?? err}`,
      },
    });
    this[LOGGER].error(`Error occurred during CoreV1 API call: ${err?.message ?? err}`);
  }

  /**
   * Calculates the base url and protocol of a given service, then returns it.
   * @private
   * @param {object} service - Service object with parameters from k8s service.
   * @returns {Promise<object>} Returns the service object with calculated baseURL and protocol.
   */
  async calculateBaseUrl(service) {
    let ingressServiceMap = {};
    if (this.k8sConfig.discoverIngress) {
      ingressServiceMap = await this.requestIngressMap({
        namespace: this.namespace,
      });
    }
    const serviceurl = `${service.name}:${
      service.configQueryPort ? service.configQueryPort : service.port
    }`;

    let ingressBaseurl = service.externalURLPrefix;
    if (this.k8sConfig.discoverIngress) {
      if (serviceurl in ingressServiceMap) {
        const { ingressHost, ingressPort, ingressPath } = ingressServiceMap[serviceurl];
        // TODO determine protocol from Ingress config
        ingressBaseurl = `http://${ingressHost}:${ingressPort}${ingressPath}`;
      } else {
        this[LOGGER].error(`There is no ingress config for ${serviceurl}.`);
      }
    }
    let protocol = service.configQueryProtocol;
    if (!protocol) {
      protocol = this.k8sConfig.useHttps ? 'https' : 'http';
    }
    return {
      name: service.appName,
      version: service.version,
      protocol,
      serviceurl,
      ingressBaseurl,
      uiContentConfigContext: service.uiContentConfigContext,
    };
  }

  mapService(serviceObject) {
    const { extraAnnotations } = this.k8sConfig;
    const { annotations = {}, labels = {} } = serviceObject.metadata;
    const logger = this[LOGGER];
    const service = {
      port: serviceObject.spec?.ports?.[0].port,
      name: serviceObject.metadata.name,
      configQueryProtocol: annotations[this.k8sConfig.queryProtocolAnnotation],
      configQueryPort: annotations[this.k8sConfig.queryPortAnnotation],
      uiContentConfigContext:
        annotations[this.k8sConfig.uiContentConfigContextAnnotation] || DEFAULT_UI_CONTEXT,
      appName: labels[this.k8sConfig.appNameLabel],
      version: labels[this.k8sConfig.appVersionLabel],
    };

    if (extraAnnotations) {
      Object.keys(extraAnnotations).forEach((annotation) => {
        if (Object.keys(service).includes(annotation)) {
          logger.info(
            `Optional annotation ${annotation} would overwrite an already defined system default one. Moving on with the existing value: ${service.annotation}`,
          );
          return;
        }
        service[annotation] = annotations[extraAnnotations[annotation]];
      });
    }

    return service;
  }
}

export default K8sQueryService;
