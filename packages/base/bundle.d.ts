/// <reference types="node" />
/// <reference types="node" />
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
    }
}
declare module "utils/fileHelper" {
    /**
     * Watch a file or directory for changes and invoke a function when it changes.
     * @private
     * @param {string|string[]} filepaths - Path or paths to files or directories to be watched for changes
     * @param {Function} func - A function to invoke when the file path changes
     * @param {Object} logger - Logger instance to output messages
     * @returns {Object} - An fs object
     */
    export function watchFile(filepaths: string | string[], func: Function, logger: any): any;
    /**
     * Stops watching a chokidar file.
     * @private
     * @param {object} chokidarObj - The watcher object that needs to be stopped
     * @param {Object} logger - Logger instance to output messages
     */
    export function stopFileWatch(chokidarObj: object, logger: any): void;
}
declare module "configManager/ConfigManager" {
    export default ConfigManager;
    /**
     * Contains application main config which updates with config json file.
     * In common use extends with application services configs.
     *
     * @extends EventEmitter
     */
    class ConfigManager extends EventEmitter<[never]> {
        static FILE_TYPES: Readonly<{
            JSON: "JSON";
            TEXT: "TEXT";
        }>;
        /**
         * @param {object[]} configList - Configs parameters.
         * @param {string} configList[].name - The name of the config.
         * @param {string} configList[].filePath - Path to the file which will update the config.
         * @param {object} [configList[].schema] - Schema to validate the file.
         * @param {Array<object>} [configList[].additionalSchemaList] - Additional list of schemas referenced by the main schema.
         * @param {string} [configList[].defaultValue] - Config's default value.
         * @param {object} [logger] - Logger instance.
         */
        constructor(configList: {
            name: string;
            filePath: string;
            schema?: object;
            additionalSchemaList?: Array<object>;
            defaultValue?: string;
        }, logger?: object);
        configWatchMap: Map<any, any>;
        configMap: Map<any, any>;
        logger: any;
        /**
         * Gets the configuration by its name. Returns an array if the configuration is an array.
         *
         * @param {string} configName - Configuration name.
         * @returns {object|undefined} Configuration object.
         */
        get(configName: string): object | undefined;
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
        startConfigWatch(options: {
            name: string;
            filePath: string;
            schema?: object;
            additionalSchemaList?: Array<object>;
            defaultValue?: object;
            fileType?: string;
        }): void;
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
        private _updateConfig;
        /**
         * Stops monitoring changes in all configuration files and removes all event listeners.
         */
        stopAllConfigWatch(): void;
    }
    import { EventEmitter } from "events";
}
declare module "certificateManager/CertificateManager" {
    export default CertificateManager;
    /**
     * Manages certificates for TLS enabled services.
     *
     * @extends EventEmitter
     */
    class CertificateManager extends EventEmitter<[never]> {
        /**
         * Sets basic configs for the manager and starts watching certificates if TLS is globally enabled.
         *
         * @param {object} options - Set of options.
         * @param {boolean} options.tlsEnabled - True if TLS enabled globally.
         * @param {object} options.dependenciesConfig - Dependencies configuration.
         * @param {string} options.certificatePath - Path to the folder containing the certificates.
         * @param {number} options.certificateWatchDebounceTime - Delay time in ms.
         * @param {object} [options.certificateConfig] - Certificates configuration.
         * @param {string} [options.certificateConfig.ca] - The name of the CA.
         * @param {string} [options.certificateConfig.key] - The name of the key file.
         * @param {string} [options.certificateConfig.cert] - The name of the certificate.
         * @param {object} [options.serverCertificateConfig] - Server certificates configuration.
         * @param {string} [options.serverCertificateConfig.certDir] - Certificate and key file directory.
         * @param {Array<string>} [options.serverCertificateConfig.caCertDirs] - Array of CA directories
         * or paths for CA file.
         * @param {string} [options.serverCertificateConfig.key] - The name of the key file.
         * @param {string} [options.serverCertificateConfig.cert] - The name of the certificate.
         * @param {boolean} [options.serverCertificateConfig.verifyClientCert] - Indicates that it's needed
         * to verify client certificate.
         * @param {object} [options.logger] - Logger instance.
         */
        constructor(options: {
            tlsEnabled: boolean;
            dependenciesConfig: object;
            certificatePath: string;
            certificateWatchDebounceTime: number;
            certificateConfig?: {
                ca?: string;
                key?: string;
                cert?: string;
            };
            serverCertificateConfig?: {
                certDir?: string;
                caCertDirs?: Array<string>;
                key?: string;
                cert?: string;
                verifyClientCert?: boolean;
            };
            logger?: object;
        });
        tlsServices: any;
        options: {
            tlsEnabled: boolean;
            dependenciesConfig: object;
            certificatePath: string;
            certificateWatchDebounceTime: number;
            certificateConfig?: {
                ca?: string;
                key?: string;
                cert?: string;
            };
            serverCertificateConfig?: {
                certDir?: string;
                caCertDirs?: Array<string>;
                key?: string;
                cert?: string;
                verifyClientCert?: boolean;
            };
            logger?: object;
        };
        logger: any;
        /**
         * @typedef {object} TlsConfig
         * @property {boolean} enabled - Whether to use TLS for the service.
         * @property {boolean} [verifyServerCert=true] - Whether the peer service's server certificate
         * should be verified against the root CA. The default value is true.
         * @property {boolean} [sendClientCert=true] - Whether to use TLS client authentication.
         * The default value is true.
         */
        /**
         * Creates a base object filled with enabled services.
         * @private
         *
         * @param {Object<string, TlsConfig>} dependencyConfigMap - The dependencies config in JSON
         * format. The service options object should contain a TlsOption object.
         * @returns {object} Enabled services.
         */
        private _createTLSServiceMap;
        /**
         * Loads the certificates and keys for all TLS enabled services, to be used in the future with
         * the HTTPS agent specific to each service. The files are watched for new changes and reloads
         * them when a change occurs.
         * As usually the certificates are renewed at the same time for the same service,
         * a debounced version of the file watch callback is created or each service.
         * @private
         */
        private _startCertificateWatch;
        /**
         * Loads all server CAs, certificates and keys. These files are watched
         * for new changes and reloads them when a change occurs.
         * @private
         */
        private _startServerCertificateWatch;
        /**
         * Read the certificates and keys used in TLS communication.
         * Where the CA, the certificate and the private key files are found in PEM format.
         *
         * @private
         * @throws Will throw an error if could not read certificate files.
         */
        private _readServerCertificate;
        serverHttpsOpts: {
            ca: any[];
            cert: string;
            key: string;
            requestCert: boolean;
            minVersion: string;
        };
        /**
         * Checks if certificate folder contains certificate and returns the path
         * for the certificate.
         *
         * @param {string} folderName - CA certificate folder name.
         * @returns {string|null} Path to the CA certificate.
         * @private
         */
        private _findCertificateFile;
        /**
         * Check if it is path for CA file
         * @param {string} certPath
         * @private
         */
        private _isCaFile;
        /**
         * Read the certificates and keys used in TLS communication with a peer service. When read
         * it updates the secure context for that peer service.
         * @private
         *
         * @param {object} params - Set of parameters.
         * @param {string} params.serviceName - The name of the TLS service.
         * @param {string} params.serviceCertDir - The path to the certificate directory of the service
         * where the CA, the certificate and the private key files are found in PEM format.
         * @throws Will throw an error if could not read certificate files.
         */
        private _readServiceCertificate;
        /**
         * Stops monitoring certificate changes and removes all event listeners.
         */
        stopCertificateWatch(): void;
        /**
         * Stops monitoring server certificate changes and removes all event listeners.
         */
        stopServerCertificateWatch(): void;
        /**
         * Returns object with TLS options for a given service.
         *
         * @param {string} serviceName - The name of the service, it should be the same key which is
         * used in the options.dependenciesConfig.
         * @returns {object} An object which contains the https configuration options.
         */
        getTLSOptions(serviceName: string): object;
        /**
         * Returns server https options.
         *
         * @returns {object|null} Server https options.
         * @public
         */
        public getServerHttpsOpts(): object | null;
    }
    import { EventEmitter } from "events";
}
declare module "certificateManager/NonTLSCertificateManager" {
    export default NonTLSCertificateManager;
    /**
     * Generates a constant TLS options.
     */
    class NonTLSCertificateManager {
        /**
         * Sets basic configs for the manager.
         *
         * @param {object} options - Set of options.
         * @param {string} options.serviceName - Name of the service.
         * @param {string} options.serverCertPath - Path to the service certificate.
         * @param {object} [options.logger] - Logger instance.
         */
        constructor(options: {
            serviceName: string;
            serverCertPath: string;
            logger?: object;
        });
        options: {
            serviceName: string;
            serverCertPath: string;
            logger?: object;
        };
        logger: any;
        /**
         * Returns object with TLS options for a given service.
         *
         * @returns {object} An object which contains a configured tlsAgent object.
         */
        getTLSOptions(): object;
        #private;
    }
}
declare module "uiConfig/UiConfigService" {
    export default UiConfigService;
    /**
     * Contains additional config
     * to be provided as configs to the front-end,
     * which updates with config json file.
     *
     * @extends EventEmitter
     * @fires UiConfigService#ui-config-changed
     */
    class UiConfigService extends EventEmitter<[never]> {
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
        constructor(options: {
            configFilePath: string;
            configManager: object;
            defaultValue?: object;
            configObject?: object;
        });
        configManager: any;
        uiConfig: {};
        configObject: any;
        /**
         * Updates UI config with current values from the `configManager`.
         */
        updateUIConfig(): void;
        /**
         * Returns current UI config.
         *
         * @returns {object} UI config.
         */
        getUIConfig(): object;
        /**
         * Creates middleware which returns UI config.
         *
         * @returns {Function} Middleware function.
         */
        getUIConfigMiddleware(): Function;
    }
    import { EventEmitter } from "events";
}
declare module "logging/utils" {
    export function parseProtocol(protocol: any): {
        type: string;
        family: number;
    };
    /**
     * Function merges recursively two objects.
     *
     * @param {object} [baseObj={}] - Initial base object.
     * @param {object} [obj={}] - Object to be merged.
     * @returns {object} Resulting object.
     */
    export function mergeObj(baseObj?: object, obj?: object): object;
}
declare module "logging/constants" {
    export default CONSTANTS;
    namespace CONSTANTS {
        let METADATA_ID: string;
        let SYSLOG_TYPE: string;
        let DEFAULT_CATEGORY: string;
        namespace DEFAULT_LOG {
            let enabled: boolean;
            let defaultLogLevel: string;
            let serviceName: string;
            namespace stdout {
                let enabled_1: boolean;
                export { enabled_1 as enabled };
                export let facility: string;
            }
            namespace filelog {
                let enabled_2: boolean;
                export { enabled_2 as enabled };
                export let logDirName: string;
                export let logFileName: string;
                export let maxSize: number;
                export let maxFiles: number;
            }
            namespace syslog {
                let enabled_3: boolean;
                export { enabled_3 as enabled };
                export let syslogHost: string;
                export let syslogFacility: string;
                export namespace tls {
                    let enabled_4: boolean;
                    export { enabled_4 as enabled };
                }
            }
            namespace jsonTCPLog {
                let enabled_5: boolean;
                export { enabled_5 as enabled };
                export let host: string;
                let facility_1: string;
                export { facility_1 as facility };
                export namespace tls_1 {
                    let enabled_6: boolean;
                    export { enabled_6 as enabled };
                }
                export { tls_1 as tls };
            }
        }
        namespace LOG_LEVELS {
            let critical: number;
            let error: number;
            let warning: number;
            let info: number;
            let debug: number;
        }
        namespace LOG_COLORS {
            let critical_1: string;
            export { critical_1 as critical };
            let error_1: string;
            export { error_1 as error };
            let warning_1: string;
            export { warning_1 as warning };
            let info_1: string;
            export { info_1 as info };
            let debug_1: string;
            export { debug_1 as debug };
        }
        namespace FACILITIES {
            export namespace kern {
                let code: string;
                let name: string;
            }
            export namespace user {
                let code_1: string;
                export { code_1 as code };
                let name_1: string;
                export { name_1 as name };
            }
            export namespace mail {
                let code_2: string;
                export { code_2 as code };
                let name_2: string;
                export { name_2 as name };
            }
            export namespace daemon {
                let code_3: string;
                export { code_3 as code };
                let name_3: string;
                export { name_3 as name };
            }
            export namespace auth {
                let code_4: string;
                export { code_4 as code };
                let name_4: string;
                export { name_4 as name };
            }
            export namespace syslog_1 {
                let code_5: string;
                export { code_5 as code };
                let name_5: string;
                export { name_5 as name };
            }
            export { syslog_1 as syslog };
            export namespace lpr {
                let code_6: string;
                export { code_6 as code };
                let name_6: string;
                export { name_6 as name };
            }
            export namespace news {
                let code_7: string;
                export { code_7 as code };
                let name_7: string;
                export { name_7 as name };
            }
            export namespace uucp {
                let code_8: string;
                export { code_8 as code };
                let name_8: string;
                export { name_8 as name };
            }
            export namespace clock {
                let code_9: string;
                export { code_9 as code };
                let name_9: string;
                export { name_9 as name };
            }
            export namespace sec {
                let code_10: string;
                export { code_10 as code };
                let name_10: string;
                export { name_10 as name };
            }
            export namespace ftp {
                let code_11: string;
                export { code_11 as code };
                let name_11: string;
                export { name_11 as name };
            }
            export namespace ntp {
                let code_12: string;
                export { code_12 as code };
                let name_12: string;
                export { name_12 as name };
            }
            export namespace audit {
                let code_13: string;
                export { code_13 as code };
                let name_13: string;
                export { name_13 as name };
            }
            export namespace alert {
                let code_14: string;
                export { code_14 as code };
                let name_14: string;
                export { name_14 as name };
            }
            export namespace clock2 {
                let code_15: string;
                export { code_15 as code };
                let name_15: string;
                export { name_15 as name };
            }
            export namespace local0 {
                let code_16: string;
                export { code_16 as code };
                let name_16: string;
                export { name_16 as name };
            }
            export namespace local1 {
                let code_17: string;
                export { code_17 as code };
                let name_17: string;
                export { name_17 as name };
            }
            export namespace local2 {
                let code_18: string;
                export { code_18 as code };
                let name_18: string;
                export { name_18 as name };
            }
            export namespace local3 {
                let code_19: string;
                export { code_19 as code };
                let name_19: string;
                export { name_19 as name };
            }
            export namespace local4 {
                let code_20: string;
                export { code_20 as code };
                let name_20: string;
                export { name_20 as name };
            }
            export namespace local5 {
                let code_21: string;
                export { code_21 as code };
                let name_21: string;
                export { name_21 as name };
            }
            export namespace local6 {
                let code_22: string;
                export { code_22 as code };
                let name_22: string;
                export { name_22 as name };
            }
            export namespace local7 {
                let code_23: string;
                export { code_23 as code };
                let name_23: string;
                export { name_23 as name };
            }
        }
        let WAIT_FOR_LOG_SERVER: number;
    }
}
declare module "utils/loggerHelper" {
    /**
     * Generate logging data in json format, which can be collected for further processing.
     *
     * @param {object} data - Raw information for Log generation.
     * @param {object} data.info - All relevant Log Information.
     * @param {string} data.level - Logging level.
     * @param {object} data.transportOptions - Relevant transport configurations.
     * @param {string} data.traceId - Telemetry trace ID.
     * @param {string | number} data.appID - Unique string representation of the service.
     * @param {string | number} data.procID - Process ID.
     * @returns {object} Information that will be sent to the Log Transporter.
     */
    export function formatLogDataToJson({ info, level, transportOptions, traceId, appID, procID }: {
        info: object;
        level: string;
        transportOptions: object;
        traceId: string;
        appID: string | number;
        procID: string | number;
    }): object;
}
declare module "logging/Console" {
    /**
     * Custom Transport for logging to standard output. The transport is based on a winstons transport class, and apply
     * it's own log method for custom logging, which is the same for TCP json logging as well.
     *
     * @extends {TransportStream}
     */
    export default class Console extends TransportStream {
        /**
         * @param {object} options - Configurations for this instance.
         * @param {string} options.category - Log category.
         * @param {string} [options.facility=local0] - Facility for the log data.
         * @param {string} [options.podName] - Pod name.
         * @param {string} [options.pid] - By default set to `process.pid`.
         * @param {string} [options.app_name] - By default set to `process.title`.
         * @param {string} [options.appName] - Deprecated (same as app_name).
         * @param {object} [options.metadata] - Additional metadata.
         * @param {string} [options.metadata.namespace] - Namespace.
         * @param {string} [options.metadata.node_name] - Node name.
         * @param {string} [options.metadata.container_name] - Container name.
         * @param {string} [options.metadata.service_version] - Service name with version.
         * @param {string} [options.format] - Format property, which is reserved for winston. Used when stdout format is 'text'.
         * @param {object} [telemetryServiceInstance] - TelemetryService instance.
         */
        constructor(options: {
            category: string;
            facility?: string;
            podName?: string;
            pid?: string;
            app_name?: string;
            appName?: string;
            metadata?: {
                namespace?: string;
                node_name?: string;
                container_name?: string;
                service_version?: string;
            };
            format?: string;
        }, telemetryServiceInstance?: object);
        options: {
            category: string;
            facility?: string;
            podName?: string;
            pid?: string;
            app_name?: string;
            appName?: string;
            metadata?: {
                namespace?: string;
                node_name?: string;
                container_name?: string;
                service_version?: string;
            };
            format?: string;
        };
        facility: string;
        category: string;
        procID: string | number;
        appID: string;
        telemetryService: any;
        levels: {};
        get name(): string;
        log(info: any, callback: any): any;
    }
    import TransportStream from "winston-transport";
}
declare module "logging/Syslog" {
    export default Syslog;
    /**
     * Transport capable of sending RFC 3164 and RFC 5424 compliant messages.
     * @private
     * @extends Transport
     */
    class Syslog extends winston.transport {
        /**
         * @param {object} options - Options for this instance.
         * @param {object} [telemetryServiceInstance] - TelemetryService instance.
         */
        constructor(options: object, telemetryServiceInstance?: object);
        levels: any;
        inFlight: number;
        syslogServerNotAvailableSince: number;
        telemetryService: any;
        queue: any;
        socket: net.Socket | tls.TLSSocket;
        producer: any;
        /**
         * Expose the name of this Transport on the prototype.
         *
         * @returns {string} Value 'syslog'.
         */
        get name(): string;
        /**
         * Set winston syslog configurations.
         *
         * @param {object} options - Set of options.
         * @param {string} options.category - Log category.
         * @param {string} [options.host=localhost] - Host address.
         * @param {number} [options.port=5014] - Port.
         * @param {string} [options.path=null] - Path.
         * @param {string} [options.protocol=tcp4] - Protocol type.
         * @param {object} [options.protocolOptions={}] - Protocol options.
         * @param {string} [options.eol] - End of line.
         * @param {string} [options.localhost=localhost] - Localhost.
         * @param {string} [options.type=RFC5424] - The Syslog Protocol type.
         * @param {string} [options.facility=local0] - Facility for the log producer.
         * @param {string} [options.pid] - By default set to `process.pid`.
         * @param {string} [options.appName] - By default set to `process.title`.
         * @param {string} [options.app_name] - Thee same as `options.app_name`.
         */
        setOptions(options: {
            category: string;
            host?: string;
            port?: number;
            path?: string;
            protocol?: string;
            protocolOptions?: object;
            eol?: string;
            localhost?: string;
            type?: string;
            facility?: string;
            pid?: string;
            appName?: string;
            app_name?: string;
        }): void;
        categoryId: string;
        host: string;
        port: number;
        path: string;
        protocol: string;
        protocolOptions: any;
        endOfLine: string;
        localhost: string;
        type: string;
        facility: string;
        pid: string | number;
        appName: string;
        /**
         * Parse and store protocol.
         *
         * @param {string} [protocol] - By default set to `this.protocol`.
         */
        parseProtocol(protocol?: string): void;
        protocolType: string;
        protocolFamily: number;
        /**
         * Core logging method exposed to Winston. Logs the `msg` and optional
         * metadata, `meta`, to the specified `level`.
         *
         * @param {object} info - All relevant log information.
         * @param {Function} callback - Continuation to respond to when complete.
         * @returns {Function} Result of `connect()` method invocation.
         */
        log(info: object, callback: Function): Function;
        /**
         * Closes the socket used by this transport freeing the resource.
         */
        close(): void;
        /**
         * Connects to the remote syslog server using `dgram` or `net` depending
         * on the `protocol` for this instance.
         *
         * @param {Function} callback - Continuation to respond to when complete.
         * @returns {Function|null} Callback invocation or null.
         */
        connect(callback: Function): Function | null;
        /**
         * Setup events on the socket
         * @private
         *
         * @param {Object} socket
         */
        private setupEvents;
        #private;
    }
    import winston from "winston";
    import * as net from "net";
    import * as tls from "tls";
}
declare module "logging/JsonTCP" {
    /**
     * Transport for outputting to a JSON/TCP server.
     *
     * @extends {Transport}
     * @fires logged
     * @fires error
     * @fires closed
     */
    export default class JsonTCP extends Transport {
        /**
         * @param {object} options - Configurations for this instance.
         * @param {string} options.category - Log category.
         * @param {boolean} options.tls - Whether connection secure or not.
         * @param {string} [options.host=localhost] - Host address.
         * @param {number} [options.port] - Port.
         * @param {string} [options.path=null] - Path.
         * @param {string} [options.protocol=tcp4] - Protocol type.
         * @param {object} [options.protocolOptions={}] - Protocol options.
         * @param {string} [options.logSeparator=`\n`] - Separator between log data sent to the Log Transformer.
         * @param {string} [options.facility=local0] - Facility for the log data.
         * @param {string} [options.podName] - Pod name.
         * @param {string} [options.pid] - By default set to `process.pid`.
         * @param {string} [options.app_name] - By default set to `process.title`.
         * @param {string} [options.appName] - Deprecated (same as app_name).
         * @param {object} [options.metadata] - Additional metadata.
         * @param {string} [options.metadata.namespace] - Namespace.
         * @param {string} [options.metadata.node_name] - Node name.
         * @param {string} [options.metadata.container_name] - Container name.
         * @param {string} [options.metadata.service_version] - Service name with version.
         * @param {object} [telemetryServiceInstance] - TelemetryService instance.
         */
        constructor(options: {
            category: string;
            tls: boolean;
            host?: string;
            port?: number;
            path?: string;
            protocol?: string;
            protocolOptions?: object;
            logSeparator?: string;
            facility?: string;
            podName?: string;
            pid?: string;
            app_name?: string;
            appName?: string;
            metadata?: {
                namespace?: string;
                node_name?: string;
                container_name?: string;
                service_version?: string;
            };
        }, telemetryServiceInstance?: object);
        options: {
            category: string;
            tls: boolean;
            host?: string;
            port?: number;
            path?: string;
            protocol?: string;
            protocolOptions?: object;
            logSeparator?: string;
            facility?: string;
            podName?: string;
            pid?: string;
            app_name?: string;
            appName?: string;
            metadata?: {
                namespace?: string;
                node_name?: string;
                container_name?: string;
                service_version?: string;
            };
        };
        tls: boolean;
        facility: string;
        category: string;
        host: string;
        port: number;
        protocol: string;
        procID: string | number;
        appID: string;
        protocolOptions: any;
        protocolFamily: number;
        logSeparator: string;
        telemetryService: any;
        levels: {};
        inFlight: number;
        logServerNotAvailableSince: number;
        socket: net.Socket | tls.TLSSocket;
        queue: any;
        /**
         * Expose the name of this Transport on the prototype.
         *
         * @returns {string} The name, 'jsonTCP'.
         */
        get name(): string;
        /**
         * Core logging method exposed to Winston.
         *
         * @param {object} info -  All relevant log information.
         * @param {Function} callback - Continuation to respond to when complete.
         * @returns {Function} Result of `connect()` method invocation.
         */
        log(info: object, callback: Function): Function;
        /**
         * Connects to the remote Log Transformer server using `dgram` or `net` depending
         * on the `protocol` for this instance.
         *
         * @param {Function} callback - Continuation to respond to when complete.
         * @returns {Function|null} Callback invocation or null.
         */
        connect(callback: Function): Function | null;
        /**
         * Setup events on the socket
         * @private
         *
         * @param {object} socket
         */
        private _setupEvents;
        /**
         * Closes the socket used by this transport freeing the resource.
         */
        close(): void;
    }
    import Transport from "winston-transport";
    import * as net from "net";
    import * as tls from "tls";
}
declare module "logging/logging" {
    export default logger;
    export type FilelogConfig = {
        /**
         * - Turns on writing logs to a file.
         */
        enabled: boolean;
        /**
         * - Can be just a name or contains full path to the file.
         */
        logFileName: string;
        /**
         * - Directory where the file should be written. Can
         * be omitted if logFileName contains the full path.
         */
        logDirName: string;
        /**
         * - Maximum file size in bytes.
         */
        maxSize: number;
        /**
         * - Maximum number of files.
         */
        maxFiles: number;
    };
    export type SyslogConfig = {
        /**
         * - Turns on syslog logs.
         */
        enabled: boolean;
        /**
         * - Host address of log server.
         */
        syslogHost: string;
        /**
         * - Default facility (=local0).
         */
        syslogFacility: string;
        /**
         * - Facilities for certain categories,
         * where key is a category and value is a facility.
         */
        facilityCategories?: object;
        /**
         * - TLS configuration.
         */
        tls: {
            enabled: boolean;
            protocolOptions: object;
        };
        /**
         * - Pod name.
         */
        podName: string;
        /**
         * - Additional metadata.
         */
        metadata: object;
    };
    export type JsonTCPLogConfig = {
        /**
         * - Turns on JSON-TCP logs.
         */
        enabled: boolean;
        /**
         * - Host address of log server.
         */
        host: string;
        /**
         * - Default facility (=local0).
         */
        facility: string;
        /**
         * - Facilities for certain categories,
         * where key is a category and value is a facility.
         */
        facilityCategories?: object;
        /**
         * - Port to reach log server.
         */
        port?: number;
        /**
         * - Protocol to reach log server.
         */
        protocol?: string;
        /**
         * - TLS configuration.
         */
        tls: {
            enabled: boolean;
            protocolOptions: object;
        };
        /**
         * - Pod name.
         */
        podName: string;
        /**
         * - Additional metadata.
         */
        metadata: object;
        /**
         * - Separator between log messages. For
         * Log Transformer it should be a new line `\n`.
         */
        logSeparator?: string;
    };
    export type ConsoleLogConfig = {
        /**
         * - Turns on logs for console.
         */
        enabled: boolean;
        /**
         * - Default facility (=local0).
         */
        facility: string;
        /**
         * - Facilities for certain categories,
         * where key is a category and value is a facility.
         */
        facilityCategories?: object;
        /**
         * - Pod name.
         */
        podName: string;
        /**
         * - Additional metadata.
         */
        metadata: object;
        /**
         * - Separator between log messages. For
         * Log Transformer it should be a new line `\n`.
         */
        logSeparator?: string;
    };
    const logger: Logger;
    /**
     * @typedef {object} FilelogConfig
     * @property {boolean} enabled - Turns on writing logs to a file.
     * @property {string} logFileName - Can be just a name or contains full path to the file.
     * @property {string} logDirName - Directory where the file should be written. Can
     * be omitted if logFileName contains the full path.
     * @property {number} maxSize - Maximum file size in bytes.
     * @property {number} maxFiles - Maximum number of files.
     */
    /**
     * @typedef {object} SyslogConfig
     * @property {boolean} enabled - Turns on syslog logs.
     * @property {string} syslogHost - Host address of log server.
     * @property {string} syslogFacility - Default facility (=local0).
     * @property {object} [facilityCategories] - Facilities for certain categories,
     * where key is a category and value is a facility.
     * @property {object} tls - TLS configuration.
     * @property {boolean} tls.enabled - Turns on TLS.
     * @property {object} tls.protocolOptions - Additional protocol options.
     * @property {string} podName - Pod name.
     * @property {object} metadata - Additional metadata.
     */
    /**
     * @typedef {object} JsonTCPLogConfig
     * @property {boolean} enabled - Turns on JSON-TCP logs.
     * @property {string} host - Host address of log server.
     * @property {string} facility - Default facility (=local0).
     * @property {object} [facilityCategories] - Facilities for certain categories,
     * where key is a category and value is a facility.
     * @property {number} [port] - Port to reach log server.
     * @property {string} [protocol] - Protocol to reach log server.
     * @property {object} tls - TLS configuration.
     * @property {boolean} tls.enabled - Turns on TLS.
     * @property {object} tls.protocolOptions - Additional protocol options.
     * @property {string} podName - Pod name.
     * @property {object} metadata - Additional metadata.
     * @property {string} [logSeparator] - Separator between log messages. For
     * Log Transformer it should be a new line `\n`.
     */
    /**
     * @typedef {object} ConsoleLogConfig
     * @property {boolean} enabled - Turns on logs for console.
     * @property {string} facility - Default facility (=local0).
     * @property {object} [facilityCategories] - Facilities for certain categories,
     * where key is a category and value is a facility.
     * @property {string} podName - Pod name.
     * @property {object} metadata - Additional metadata.
     * @property {string} [logSeparator] - Separator between log messages. For
     * Log Transformer it should be a new line `\n`.
     */
    /**
     * Contains methods to set up Winston transport according to the provided configuration. Supports
     * logging to the console, to the file, and to the remote syslog consumer.
     *
     * @extends EventEmitter
     * @fires Logger#syslog-error
     * @fires Logger#jsontcp-error
     */
    class Logger extends EventEmitter<[never]> {
        constructor();
        /**
         * Returns logging levels.
         *
         * @returns {object} Logging levels.
         */
        get LOG_LEVELS(): any;
        /**
         * Returns a Winston configuration object.
         * @private
         *
         * @param {object} [config] - The configuration.
         * @param {string} [category] - Logging category.
         * @returns {object} The Winston config object catch.
         */
        private _getWinstonConfig;
        /**
         * Store the logging config for future loggers and reconfigure already existing ones.
         *
         * @param {object} newLogConfig - Config object.
         * @param {boolean} newLogConfig.enabled - Enables logging.
         * @param {string} newLogConfig.serviceName - Log category.
         * @param {string} newLogConfig.defaultLogLevel - Default logging level (=info).
         * @param {object} newLogConfig.logLevelCategories - Levels for certain categories, where key
         * is a category and value is a logging level.
         * @param {ConsoleLogConfig} newLogConfig.stdout - Console logs configuration.
         * @param {FilelogConfig} newLogConfig.filelog - File logs configuration.
         * @param {SyslogConfig} newLogConfig.syslog - Syslog configuration.
         * @param {JsonTCPLogConfig} newLogConfig.jsonTCPLog - Syslog configuration.
         */
        configureLogger(newLogConfig: {
            enabled: boolean;
            serviceName: string;
            defaultLogLevel: string;
            logLevelCategories: object;
            stdout: ConsoleLogConfig;
            filelog: FilelogConfig;
            syslog: SyslogConfig;
            jsonTCPLog: JsonTCPLogConfig;
        }): void;
        /**
         * Get a logger from the Winston log container. If it does not exist then Winston will create it.
         *
         * @param {string} [category='default'] - Category of the message.
         * @returns {object} Logger object.
         */
        getLogger(category?: string): object;
        /**
         * Set the provided Telemetry Service for the Logger.
         *
         * @param {object} telemetryServiceInstance - An instance of the Telemetry Service.
         * @returns {void}
         */
        setTelemetryService(telemetryServiceInstance: object): void;
        #private;
    }
    import { EventEmitter } from "events";
}
declare module "index" {
    import ConfigManager from "configManager/ConfigManager";
    import CertificateManager from "certificateManager/CertificateManager";
    import NonTLSCertificateManager from "certificateManager/NonTLSCertificateManager";
    import UIConfigService from "uiConfig/UiConfigService";
    import logger from "logging/logging";
    export { ConfigManager, CertificateManager, NonTLSCertificateManager, UIConfigService, logger };
}
