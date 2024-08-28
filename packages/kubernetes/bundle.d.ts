/// <reference types="node" />
declare module "constants" {
    export namespace RESOURCE_CHANGE_TYPE {
        let ADD: string;
        let DELETE: string;
        let MODIFY: string;
    }
    export namespace RESOURCE_TYPE {
        let SERVICE: string;
        let POD: string;
        let ENDPOINT: string;
    }
    export const RESOURCE_TYPE_NAME: {
        [x: string]: string;
    };
    export namespace DEFAULT_CONFIGS {
        let watchReconnectInterval: number;
        let podStartupTimeout: number;
        let podTerminationTimeout: number;
        let podReplicaStartupTimeout: number;
        let serviceAccountDir: string;
    }
    export namespace SERVICE_EVENTS {
        let ADDED: string;
        let MODIFIED: string;
        let DELETED: string;
    }
    export const DEFAULT_UI_CONTEXT: "/";
    export const MAX_LOOP_ID: 1000;
}
declare module "metrics/k8sResourceMetric" {
    export default K8sResourceMetric;
    /**
     * Class representing a resources metric.
     * @private
     * @extends events.EventEmitter
     */
    class K8sResourceMetric extends events.EventEmitter<[never]> {
        /**
         * Create a metric and a map for a given resource's type.
         *
         * @param {object} options - Options for k8sResourceMetric constructor.
         */
        constructor(options: object);
        resourceType: any;
        resourcesMap: Map<any, any>;
        _metricEnabled: any;
        _metricName: string;
        _metric: any;
        /**
         * Set metric value to the amount of resources.
         *
         * @private
         */
        private _updateValue;
        /**
         * Add resource with its service name.
         *
         * @param {string} name - Name of the added service.
         * @param {string} serviceName - K8 Name of the service.
         */
        add(name: string, serviceName: string): void;
        /**
         * Remove resource by name.
         *
         * @param {string} name - Name of the removed service.
         */
        remove(name: string): void;
        /**
         * Remove resources by given service name.
         *
         * @param {string} name - Name of the removed service.
         */
        removeByServiceName(name: string): void;
        /**
         * Updates resources map according to a given change type.
         *
         * @param {object} parameters - Properties described below.
         * @param {string} parameters.type - Change type. Possible values are: 'ADDED', 'DELETED', 'MODIFIED'.
         * @param {string} parameters.name - Resource's name.
         * @param {string} [parameters.serviceName] - Resource's service name. Later it will help to delete resources when their service will be deleted.
         */
        update({ type, name, serviceName }: {
            type: string;
            name: string;
            serviceName?: string;
        }): void;
        /**
         * Set metric value to 0.
         */
        reset(): void;
        /**
         * Delete metric.
         */
        clear(): void;
        [LOGGER]: any;
        [PM]: any;
    }
    import * as events from "events";
    const LOGGER: unique symbol;
    const PM: unique symbol;
}
declare module "utils/waitUtil" {
    /**
     * Waits for given time in ms.
     *
     * @private
     * @param {number} ms - Time in ms.
     * @returns {Promise<void>}
     */
    export function wait(ms: number): Promise<void>;
}
declare module "k8sQuery/k8sQueryService" {
    export default K8sQueryService;
    /**
     * Class supporting Kubernetes API operations.
     */
    export type k8sConfig = {
        /**
         * - Stores the workspace name.
         */
        labelName: string;
        /**
         * - Workspace label.
         */
        labelValue: string;
        /**
         * - This object stores the config fetching options.
         */
        configFetch: object;
        /**
         * - Used for calculating the protocol for fetching.
         */
        queryProtocolAnnotation: string;
        /**
         * - Used for calculating the needed port for fetching.
         */
        queryPortAnnotation: string;
        /**
         * - The context used for fetching.
         */
        uiContentConfigContextAnnotation: string;
        /**
         * - List (as object properties) of additional annotations,
         * the values of which need to be added to the mapped service parameters, in the following format:
         * [service parameter] : [{String} source annotation].
         */
        extraAnnotations: object;
        /**
         * - Name of the fetched app.
         */
        appNameLabel: string;
        /**
         * - Version of the app.
         */
        appVersionLabel: string;
        /**
         * - If set, ingress is enabled.
         */
        discoverIngress: boolean;
        /**
         * - Ingress TLS port.
         */
        ingressTlsPort: number;
        /**
         * - Ingress HTTP port.
         */
        ingressHttpPort: number;
        /**
         * - Kubernetes service account, needed for the namespace, tokens.
         */
        serviceAccountDir: string;
        /**
         * - Setting of tls (true = https, false = http).
         * Used if queryProtocolAnnotation is not given.
         */
        useHttps: boolean;
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
    class K8sQueryService extends events.EventEmitter<[never]> {
        constructor(options: any);
        k8sConfig: any;
        namespace: string;
        k8sApi: k8s.CoreV1Api;
        k8sIngressApi: k8s.NetworkingV1Api;
        k8sWatch: k8s.Watch;
        serviceSelectors: {};
        endpoints: {};
        _resourcesMetric: {
            [x: string]: K8sResourceMetric;
        };
        /**
         * Starts the k8 cluster watching. Initializes Service, Pod and Endpoint watch logic, and also metrics.
         */
        startWatching(): Promise<void>;
        initEndpointWatch(): Promise<void>;
        endpointWatchRequest: any;
        endpointHandler(type: any, endpointObject: any): Promise<void>;
        endpointErrorHandler(err: any): Promise<void>;
        initServiceWatch(): Promise<void>;
        servicesWatchRequest: any;
        serviceHandler(type: any, serviceObject: any): Promise<void>;
        serviceErrorHandler(err: any): Promise<void>;
        waitForPodStartup(serviceName: any): Promise<void>;
        /**
         * Waits for pod termination.
         *
         * @private
         * @param {string} podName - name of the pod which is terminating.
         */
        private waitForPodTermination;
        /**
         * Waits for pod termination and after check if new pod replica created.
         * If new pod replica created then wait for pod startup.
         *
         * @private
         * @param {string} podName - name of the pod which is terminating.
         * @param {string} generatePodName - immutable part of pod name.
         * @param {string} serviceName - name of the service which contains the pod.
         */
        private waitPodReplicaCreation;
        initPodWatch(): Promise<void>;
        podsWatchRequest: any;
        podHandler(type: any, pod: any): Promise<void>;
        podErrorHandler(err: any): Promise<void>;
        /**
         * Stops the k8s cluster watch, aborts the current requests, and metrics.
         */
        stopWatching(): void;
        isServiceRelevant(serviceObject: any): boolean;
        isEndpointRelevant(endpointName: any): Promise<boolean>;
        /**
         * Returns service object from service name.
         * @private
         * @param {string} serviceName - Name of the k8 service.
         * @returns {Promise<object>} Body of the found k8 service object.
         */
        private getServiceObject;
        /**
         * Returns pod object from pod name.
         * @private
         * @param {string} podName - Name of the k8 pod.
         * @returns {Promise<object>} Body of the found k8 pod object.
         */
        private getPodObject;
        /**
         * Returns list of namespaced pods
         * @private
         * @returns {Promise<object>} Body of the found k8 pods objects.
         */
        private getNamespacedPods;
        getServiceWithBaseUrl(serviceObject: any): Promise<any>;
        getServiceNameForPod(labels: any): string;
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
        private requestIngressMap;
        ingressErrorHandler(err: any): Promise<void>;
        coreV1ErrorHandler(err: any): Promise<void>;
        /**
         * Calculates the base url and protocol of a given service, then returns it.
         * @private
         * @param {object} service - Service object with parameters from k8s service.
         * @returns {Promise<object>} Returns the service object with calculated baseURL and protocol.
         */
        private calculateBaseUrl;
        mapService(serviceObject: any): {
            port: any;
            name: any;
            configQueryProtocol: any;
            configQueryPort: any;
            uiContentConfigContext: any;
            appName: any;
            version: any;
        };
        [FM]: any;
        [PM]: any;
        [LOGGER]: any;
        #private;
    }
    import * as events from "events";
    import k8s from "@kubernetes/client-node";
    import K8sResourceMetric from "metrics/k8sResourceMetric";
    const FM: unique symbol;
    const PM: unique symbol;
    const LOGGER: unique symbol;
}
declare module "synchronization/synchronizationService" {
    export default SynchronizationService;
    class SynchronizationService {
        /**
         * Service for propagating refresh notification
         * for the other pods.
         *
         * @param {object} params - Collection of parameters.
         * @param {object} params.logger - This logger is used for warnings, errors.
         * @param {object} params.certificateManager - Watches the certificates from the helm config of the services.
         * @param {object} params.telemetryService - Tracks the http request of the service.
         * @param {syncConfig} params.syncConfig - Synchronization configuration.
         * Structure of the synchronization configuration is below.
         * @typedef {object} syncConfig
         * @property {string} tlsType - TLS option.
         * @property {string} headerValues - VIA http header from the request.
         * @property {string} headlessServiceName - Name of the headless service.
         * @property {number} servicePort - Port of the request.
         * @property {boolean} useHttps - If true protocol is https, else http.
         */
        constructor({ syncConfig, logger, certificateManager, telemetryService }: {
            logger: object;
            certificateManager: object;
            telemetryService: object;
            syncConfig: {
                /**
                 * - TLS option.
                 */
                tlsType: string;
                /**
                 * - VIA http header from the request.
                 */
                headerValues: string;
                /**
                 * - Name of the headless service.
                 */
                headlessServiceName: string;
                /**
                 * - Port of the request.
                 */
                servicePort: number;
                /**
                 * - If true protocol is https, else http.
                 */
                useHttps: boolean;
            };
        });
        syncConfig: {
            watchReconnectInterval: number;
            podStartupTimeout: number;
            podTerminationTimeout: number;
            podReplicaStartupTimeout: number;
            serviceAccountDir: string;
        } & {
            /**
             * - TLS option.
             */
            tlsType: string;
            /**
             * - VIA http header from the request.
             */
            headerValues: string;
            /**
             * - Name of the headless service.
             */
            headlessServiceName: string;
            /**
             * - Port of the request.
             */
            servicePort: number;
            /**
             * - If true protocol is https, else http.
             */
            useHttps: boolean;
        };
        TLS_TYPE_INTERNAL_REFRESH: string;
        VIA_HEADER_VALUE: string;
        headlessServiceName: string;
        servicePort: number;
        protocol: string;
        _getIPFor(hostname: any): Promise<any>;
        _sendRequest(address: any, request: any): Promise<void>;
        _getLocalIP(): Promise<any>;
        _getClusterIPs(): Promise<any>;
        /**
         * Method for calculating the necessary ip addresses
         * then notifying the other pods with the refresh request.
         *
         * @param {object} request - The request which is to be sent for other pods.
         */
        propagateRefresh(request: object): Promise<void>;
        [CM]: any;
        [DST]: any;
        [LOGGER]: any;
    }
    const CM: unique symbol;
    const DST: unique symbol;
    const LOGGER: unique symbol;
}
declare module "utils/schemaValidator" {
    export default schemaValidator;
    const schemaValidator: SchemaValidator;
    /**
     * Provides functionality to check the validity of given configurations
     * @private
     */
    class SchemaValidator {
        /**
         * Checks the passed json with a given schema.
         *
         * @param {object} json - JSON object for validation.
         * @param {object} mainSchema - Schema to validate object.
         * @param {Array<object>} [additionalSchemaList] - Additional list of schema referenced by the main schema.
         * @returns {object} Result of validation.
         */
        validateConfig(json: object, mainSchema: object, additionalSchemaList?: Array<object>): object;
        validateManualServiceConfig(json: any): import("jsonschema").ValidatorResult;
    }
}
declare module "configQuery/configQueryService" {
    export default ConfigQueryService;
    /**
     * Class to manage and store services configurations.
     *
     * @extends EventEmitter
     * @fires ConfigQueryService#service-config-updated When service configuration was updated.
     * @fires ConfigQueryService#service-config-deleted When deleting configuration after service has been removed.
     */
    class ConfigQueryService extends EventEmitter<[never]> {
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
        constructor(options: {
            serviceCollection: object;
            certificateManager: object;
            pmService: object;
            configFetchRetryPeriod: number;
            configFetchMaxRetryPeriod: number;
            internalUiName: string;
            configQueryList: {
                /**
                 * - The name of the configuration.
                 */
                configName: string;
                /**
                 * - The name of the configuration file.
                 */
                configFileName: string;
                /**
                 * - Schema to validate the configuration.
                 */
                schema: object;
                /**
                 * - If an empty config-meta could be used.
                 */
                allowEmptyConfig?: boolean;
                /**
                 * - For the case where config could be empty the default meta-value (must match the schema).
                 */
                configDefault?: object;
                /**
                 * - Additional schemas to validate the configuration.
                 */
                additionalSchemaList?: Array<object>;
                /**
                 * - Maximum amount of tries to fetch the configuration.
                 */
                limitOfTries?: number;
            }[];
            logger?: object;
            telemetryService?: object;
            maxLoopId?: number;
        });
        activeFetchLoops: {};
        gauge: any;
        /**
         * Fetches the service configuration.
         *
         * @param {object} serviceWithUrl - Service instance.
         * @param {string} configFileName - The name of the configuration file.
         * @returns {Promise<object>} Resolved promise with successfull or failed response on fetching the configuration.
         */
        fetchConfig(serviceWithUrl: object, configFileName: string): Promise<object>;
        /**
         * Handles a given service configuration(s).
         *
         * @param {object} serviceWithUrl - Service instance.
         */
        serviceHandler(serviceWithUrl: object): Promise<void>;
        /**
         * For all handled services it returns the specific configuration by its name.
         *
         * @param {string} configName - The name of configuration.
         * @returns {object} Configurations.
         */
        getConfig(configName: string): object;
        /**
         * Clear configuration data about deleted service.
         *
         * @param {object} service - Service instance.
         */
        deleteService(service: object): void;
        #private;
    }
    import { EventEmitter } from "events";
}
declare module "manualConfigHandler/manualServiceConfigHandler" {
    export default ManualServiceConfigHandler;
    /**
     * Class to manage and store manual service configs.
     *
     * @extends EventEmitter
     * @fires ManualServiceConfigHandler#service-added When a service was added.
     * @fires ManualServiceConfigHandler#service-modified When a service was modified.
     * @fires ManualServiceConfigHandler#service-deleted When a service was removed.
     */
    class ManualServiceConfigHandler extends EventEmitter<[never]> {
        /**
         * @param {object} options - Parameters.
         * @param {object} options.serviceConfigList - Configuration for the manual services.
         * @param {string} [options.logger] - Logger instance.
         */
        constructor(options: {
            serviceConfigList: object;
            logger?: string;
        });
        manualServiceConfig: any[];
        /**
         * Updates the list of configuration.
         *
         * @param {Array<object>} serviceConfigList - Configuration list.
         */
        handleServiceConfigChange(serviceConfigList: Array<object>): void;
        /**
         * Manually triggers `service-added` event for all services.
         */
        triggerInitialEvents(): void;
        #private;
    }
    import { EventEmitter } from "events";
}
declare module "serviceCollection/serviceCollection" {
    export default ServiceCollection;
    export { SERVICE_EVENTS };
    /**
     * Class to store and manage collection of services.
     *
     * @extends EventEmitter
     * @fires ServiceCollection#service-added When a service is added to the collection.
     * @fires ServiceCollection#service-modified When a service has been modified.
     * @fires ServiceCollection#service-deleted When a service is removed from the collection.
     */
    class ServiceCollection extends EventEmitter<[never]> {
        /**
         * @param {object} [logger] - Logger instance.
         */
        constructor(logger?: object);
        services: any[];
        /**
         * @private
         * @param {object} service
         * @returns {string} UID
         */
        private getServiceUID;
        /**
         * Adds the service if it isn't in the collection.
         *
         * @param {object} service - Service instance.
         */
        addService(service: object): void;
        /**
         * Modifies a given service if it exists in the collection.
         *
         * @param {object} service - Service instance.
         */
        modifyService(service: object): void;
        /**
         * Deletes a given service if it exists in the collection.
         *
         * @param {object} service - Service instance.
         */
        deleteService(service: object): void;
        /**
         * Returns the whole collection.
         *
         * @returns {Array<object>} Collection.
         */
        getServices(): Array<object>;
        /**
         * Emits service-modified event if a service with the given name exists in the collection.
         *
         * @param {string} serviceName - The name of a service.
         * @returns {true|false} If service exists in the collection, then true, otherwise false.
         */
        forceUpdateService(serviceName: string): true | false;
        #private;
    }
    import { SERVICE_EVENTS } from "constants";
    import { EventEmitter } from "events";
}
declare module "index" {
    import K8sQueryService from "k8sQuery/k8sQueryService";
    import SynchronizationService from "synchronization/synchronizationService";
    import ConfigQueryService from "configQuery/configQueryService";
    import ManualServiceConfigHandler from "manualConfigHandler/manualServiceConfigHandler";
    import ServiceCollection from "serviceCollection/serviceCollection";
    import { SERVICE_EVENTS } from "serviceCollection/serviceCollection";
    export { K8sQueryService, SynchronizationService, ConfigQueryService, ManualServiceConfigHandler, ServiceCollection, SERVICE_EVENTS };
}
