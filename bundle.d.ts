/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
declare module "auth/src/schemas/tokenParserConfigSchema" {
    export default tokenParserConfigSchema;
    namespace tokenParserConfigSchema {
        let $schema: string;
        let id: string;
        let title: string;
        let description: string;
        let type: string;
        namespace properties {
            namespace JWT_SOURCE {
                let description_1: string;
                export { description_1 as description };
                let type_1: string;
                export { type_1 as type };
                let _enum: string[];
                export { _enum as enum };
            }
            namespace JWT_NAME {
                let description_2: string;
                export { description_2 as description };
                let type_2: string;
                export { type_2 as type };
                export let minLength: number;
            }
            namespace JWT_DELIMITTER {
                let description_3: string;
                export { description_3 as description };
                let type_3: string;
                export { type_3 as type };
                let minLength_1: number;
                export { minLength_1 as minLength };
            }
            namespace JWT_KEYS_MAP {
                let description_4: string;
                export { description_4 as description };
                let type_4: string;
                export { type_4 as type };
                export namespace items {
                    let type_5: string;
                    export { type_5 as type };
                    export namespace properties_1 {
                        namespace tokenKey {
                            let type_6: string;
                            export { type_6 as type };
                            let minLength_2: number;
                            export { minLength_2 as minLength };
                        }
                        namespace mappedKey {
                            let type_7: string;
                            export { type_7 as type };
                            let minLength_3: number;
                            export { minLength_3 as minLength };
                        }
                    }
                    export { properties_1 as properties };
                }
                export let minItems: number;
            }
        }
        let required: string[];
        let additionalProperties: boolean;
    }
}
declare module "auth/src/config/defaultTokenParserConfig" {
    export default defaultTokenParserConfig;
    namespace defaultTokenParserConfig {
        let JWT_SOURCE: string;
        let JWT_KEYS_MAP: {
            tokenKey: string;
            mappedKey: string;
        }[];
        let JWT_NAME: string;
        let JWT_DELIMITTER: string;
    }
}
declare module "auth/src/cookieParser/validationError" {
    export default ValidationError;
    class ValidationError extends Error {
        constructor(message: any, parseErrors: any);
        parseErrors: any;
    }
}
declare module "auth/src/cookieParser/cookieParser" {
    /**
     * Extracts cookie with provided name from cookies string.
     * Cookies are supposed to be separated with "; ".
     *
     * @param {string} name - Cookie name that holds jwt.
     * @param {string} rawCookies - Cookies to be processed.
     * @returns {string} Extracted cookie. Still encoded though.
     */
    export function parseSingleCookieByName(name: string, rawCookies: string): string;
}
declare module "auth/src/cookieParser/authTokenParser" {
    export default AuthTokenParser;
    class AuthTokenParser {
        /**
         * @typedef {object} ParserConfig
         * @property {string} JWT_SOURCE - Source of JWT. IAM by default.
         * @property {Array} JWT_KEYS_MAP - Token abbreviations/required output keys map.
         * @property {string} JWT_NAME - Name of the cookie containing JWT.
         * @property {string} JWT_DELIMITTER - JWT header/payload/signature delimiter.
         */
        /**
         * Sets basic config.
         *
         * @param {ParserConfig} [config=defaultTokenParserConfig] - Basic config object. If not set using default value, which is compatible with IAM.
         * @throws {ValidationError} Throws ValidationError if provided config is invalid.
         */
        constructor(config?: {
            /**
             * - Source of JWT. IAM by default.
             */
            JWT_SOURCE: string;
            /**
             * - Token abbreviations/required output keys map.
             */
            JWT_KEYS_MAP: any[];
            /**
             * - Name of the cookie containing JWT.
             */
            JWT_NAME: string;
            /**
             * - JWT header/payload/signature delimiter.
             */
            JWT_DELIMITTER: string;
        });
        config: {
            /**
             * - Source of JWT. IAM by default.
             */
            JWT_SOURCE: string;
            /**
             * - Token abbreviations/required output keys map.
             */
            JWT_KEYS_MAP: any[];
            /**
             * - Name of the cookie containing JWT.
             */
            JWT_NAME: string;
            /**
             * - JWT header/payload/signature delimiter.
             */
            JWT_DELIMITTER: string;
        };
        /**
         * Retrieves mapped token fields from request cookies.
         *
         * @param {string} cookies - Raw cookies from the request to be processed.
         * @param {string} [tokenName=this.config.JWT_NAME] - JWT token identifier.
         * @returns {object | boolean} Object with required in config values, or false if no token found.
         * @memberof AuthTokenParser
         */
        getJWTPayload(cookies: string, tokenName?: string): object | boolean;
    }
}
declare module "auth/src/cookieParser/cookieParserMiddleware" {
    export function getCookieParserMiddleware(authTokenParserConfig: any): (req: any, res: any, next: any) => any;
}
declare module "auth/src/config/constants" {
    export default CONSTANTS;
    namespace CONSTANTS {
        let DEFAULT_USERNAME: string;
        let DEFAULT_LAST_LOGIN_TIME_KEY: string;
        let USER_AUTH_REALM_KEY: string;
        let ALTERNATIVE_LAST_LOGIN_KEY: string;
        let LAST_LOGIN_TIME_KEY: string;
        let USER_NAME_KEY: string;
        let FALLBACK_LOCALE: string;
        let LOGIN_TIME_PARSED_TOKEN_KEY: string;
        let DEFAULT_IAM_TLS_PORT: number;
    }
}
declare module "auth/src/utils/dateFormatter" {
    const _default: DateFormatter;
    export default _default;
    class DateFormatter {
        /**
         * Returns the locale from the environment.
         *
         * @returns {string} The locale from the environment.
         */
        get locale(): string;
        /**
         * Parses a unix timestamp string or returns the date string as is.
         *
         * @param {string} inputDate - A date string.
         * @returns {string|number} Returns the date string or a unix timestamp as an integer.
         */
        _inputHandler(inputDate: string): string | number;
        /**
         * Tells if the `inputString` is a valid date string.
         *
         * @param {string} inputDate - A date string.
         * @returns {boolean} Whether the date string is valid or not.
         */
        isInputInvalid(inputDate: string): boolean;
        /**
         * Parses the date string and returns a `DateTime` object with the locale set.
         *
         * @param {string} inputDate - A date string.
         * @returns {DateTime} A `DateTime` object with the locale set.
         */
        _getDateTimeWithLocale(inputDate: string): DateTime;
        /**
         * Converts the `inputDate` to ISO string format.
         *
         * @param {string} inputDate - A date string.
         * @returns {string} ISO string of the date string.
         */
        getIsoString(inputDate: string): string;
        /**
         * Formats the date string to a local time string (e.g.: 'Oct 14, 1983, 9:30 AM').
         *
         * @param {string} inputDate - A date string.
         * @returns {string} A locale formatted date string.
         */
        formatDayMonthYearTimeShort(inputDate: string): string;
        /**
         * Converts ISO string format from `YYYYMMDDHHMMSSZ` to `YYYY-MM-DDTHH:MM:SS.000Z`.
         *
         * @param {string} isoString - ISO string in the compact format.
         * @returns {string} ISO string in the extended format.
         */
        convertISODate(isoString: string): string;
    }
}
declare module "auth/src/cookieParser/authHandler" {
    export default AuthHandler;
    class AuthHandler {
        /**
         * Retrieves data from cookie parsing and jwt decoding.
         *
         * @param {object} options - Set of options.
         * @param {object} options.cookies - Cookies to be processed.
         * @param {string} [options.defaultUsername=DEFAULT_USERNAME] - Retrieved username when other options not available.
         * @param {string} [options.lastLoginTimeKey=DEFAULT_LAST_LOGIN_TIME_KEY] - Key of the last login time in the cookie.
         * @param {object} [options.tokenParserConfig=defaultTokenParserConfig] - Basic config object. If not set using default value, which is compatible with IAM.
         */
        constructor({ cookies, defaultUsername, lastLoginTimeKey, tokenParserConfig, }: {
            cookies: object;
            defaultUsername?: string;
            lastLoginTimeKey?: string;
            tokenParserConfig?: object;
        });
        defaultUsername: string;
        lastLoginTimeKey: string;
        cookies: any;
        tokenParserConfig: any;
        /**
         * Retrieves username with three fallback options.
         *
         * - Cookie extracting using `userName`.
         * - JWT decoding.
         * - Default username.
         *
         * @returns {string} Retrieved username.
         * @memberof AuthHandler
         */
        getUsername(): string;
        jwtData: any;
        /**
         * Parsing last login time or authentication time from cookies.
         *
         * @returns {string | undefined} Retrieved last login time or authentication time or undefined if the input is invalid.
         * @memberof AuthHandler
         */
        getAuthTime(): string | undefined;
    }
}
declare module "auth/src/iam/UserInfo" {
    export default IamUserInfo;
    export type IamConfig = {
        /**
         * - Service for which tlsOptions must be obtained from the CertificateManager.
         */
        serviceName: string;
        /**
         * - Name of the IAM service. Used for request URL.
         */
        iamServiceName: string;
        /**
         * - Protocol to connect IAM service.
         */
        protocol?: number;
        /**
         * - Port for TLS connection to the IAM service.
         */
        tlsPort?: number;
        /**
         * - Realm name. Used for request URL.
         */
        realmName?: string;
        /**
         * - Enables non-TLS mode.
         */
        nonTLSMode?: boolean;
        /**
         * - Hostname to fetch the request in case of non-TLS mode.
         */
        hostName?: string;
        /**
         * - Keys are expected normalized fields, values are
         * possible field names of the original response.
         */
        fieldMappings?: object;
        /**
         * - Keys for expected normalized fields.
         */
        responseKeys?: {
            userNameKey?: object;
            userIdKey?: object;
            loginTimeKey?: object;
        };
    };
    export type AuthOptions = {
        /**
         * - Cookies that could contain authorization token and realm name.
         */
        cookie: string;
        /**
         * - Authorization Bearer token.
         */
        authorization: string;
    };
    /**
     * @typedef {object} IamConfig
     * @property {string} serviceName - Service for which tlsOptions must be obtained from the CertificateManager.
     * @property {string} iamServiceName - Name of the IAM service. Used for request URL.
     * @property {number} [protocol=https] - Protocol to connect IAM service.
     * @property {number} [tlsPort=8444] - Port for TLS connection to the IAM service.
     * @property {string} [realmName] - Realm name. Used for request URL.
     * @property {boolean} [nonTLSMode] - Enables non-TLS mode.
     * @property {string} [hostName] - Hostname to fetch the request in case of non-TLS mode.
     * @property {object} [fieldMappings = {}] - Keys are expected normalized fields, values are
     * possible field names of the original response.
     * @property {object} [responseKeys = {}] - Keys for expected normalized fields.
     * @property {object} [responseKeys.userNameKey] - Key which will contain username in normalized response.
     * @property {object} [responseKeys.userIdKey] - Key which will contain user ID in normalized response.
     * @property {object} [responseKeys.loginTimeKey] - Key which will contain last login time in normalized response.
     */
    /**
     * @typedef {object} AuthOptions
     * @property {string} options.cookie - Cookies that could contain authorization token and realm name.
     * @property {string} options.authorization - Authorization Bearer token.
     */
    class IamUserInfo {
        /**
         * Retrieves data from cookie parsing and jwt decoding.
         *
         * @param {object} options - Set of options.
         * @param {IamConfig} options.iamConfig - Configurations for fetching user information from IAM.
         * @param {object} options.certificateManager - CertificateManager instance.
         * @param {object} [options.tokenParserConfig=defaultTokenParserConfig] - Basic config object. If not set using default value, which is compatible with IAM.
         * @param {object} [options.telemetryService] - The instance of the DST Service which will be used for telemetry.
         */
        constructor({ iamConfig, certificateManager, telemetryService, tokenParserConfig, }: {
            iamConfig: IamConfig;
            certificateManager: object;
            tokenParserConfig?: object;
            telemetryService?: object;
        });
        iamConfig: IamConfig;
        certificateManager: any;
        telemetryService: any;
        tokenParserConfig: any;
        /**
         * Retrieves user name from IAM.
         *
         * @param {AuthOptions} options - Set of options.
         * @returns {Promise<object>} `userName` property contains username according
         * to the `fieldMappings` and `responseKeys` configurations. `error` property
         * fills if the request isn't successfull.
         * @throws {Error} Throws Error if token don't pass the check or request to the IAM fails.
         */
        getUsername(options: AuthOptions): Promise<object>;
        /**
         * Retrieves user information from IAM.
         *
         * @param {AuthOptions} options - Set of options.
         * @returns {Promise<object>} `userInfo` property contains fetched data in addition
         * to the fields normalized by `fieldMappings` configuration. `error` property fills
         * if the request isn't successfull.
         * @throws {Error} Throws Error if token don't pass the check or request to the IAM fails.
         */
        fetchData(options: AuthOptions): Promise<object>;
        /**
         * Checks access token.
         *
         * @param {AuthOptions} options - Set of options.
         * @throws {Error} Throws Error if the token from cookies or authorization isn't valid.
         */
        authHeaderCheck(options: AuthOptions): void;
        #private;
    }
}
declare module "auth/src/userpermission/userPermissionHandler" {
    const _default: UserPermissionHandler;
    export default _default;
    class UserPermissionHandler {
        /**
         * Initialize UserPermissionHandler with the cookies and rest module.
         *
         * @param {object} options - A set of options.
         * @param {object} options.cookies - Cookies to be processed.
         * @param {object} options.userInfo - The object returned by the user info endpoint.
         * @param {string} options.usernameKey - Name of the userInfo field that holds name of the user.
         * @param {string} options.lastLoginTimeKey - Name of the userInfo field that holds last login time of the user.
         */
        init({ cookies, userInfo, usernameKey, lastLoginTimeKey }: {
            cookies: object;
            userInfo: object;
            usernameKey: string;
            lastLoginTimeKey: string;
        }): void;
        cookies: any;
        userInfo: any;
        usernameKey: string;
        lastLoginTimeKey: string;
        /**
         * Returns username or the default value (single space);.
         *
         * @returns {string} Retrieved username.
         */
        getUsername(): string;
        /**
         * Parsing last login time from the permission endpoint or
         * reading alternative auth solution login time from cookie.
         *
         * @returns {string | undefined} Retrieved last login time or authentication time or undefined if the input is invalid.
         */
        getAuthTime(): string | undefined;
    }
}
declare module "auth/src/index" {
    import AuthTokenParser from "auth/src/cookieParser/authTokenParser";
    import AuthHandler from "auth/src/cookieParser/authHandler";
    import IamUserInfo from "auth/src/iam/UserInfo";
    import dateFormatter from "auth/src/utils/dateFormatter";
    import userPermissionHandler from "auth/src/userpermission/userPermissionHandler";
    import { getCookieParserMiddleware } from "auth/src/cookieParser/cookieParserMiddleware";
    import { parseSingleCookieByName } from "auth/src/cookieParser/cookieParser";
    export { AuthTokenParser, AuthHandler, IamUserInfo, dateFormatter, userPermissionHandler, getCookieParserMiddleware, parseSingleCookieByName };
}
declare module "base/src/utils/schemaValidator" {
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
declare module "base/src/utils/fileHelper" {
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
declare module "base/src/configManager/ConfigManager" {
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
declare module "base/src/certificateManager/CertificateManager" {
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
declare module "base/src/certificateManager/NonTLSCertificateManager" {
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
declare module "base/src/uiConfig/UiConfigService" {
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
declare module "base/src/logging/utils" {
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
declare module "base/src/logging/constants" {
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
declare module "base/src/utils/loggerHelper" {
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
     * @param {string} data.transportFacility - Facility set for for the Transport.
     * @returns {object} Information that will be sent to the Log Transporter.
     */
    export function formatLogDataToJson({ info, level, transportOptions, traceId, appID, procID, transportFacility, }: {
        info: object;
        level: string;
        transportOptions: object;
        traceId: string;
        appID: string | number;
        procID: string | number;
        transportFacility: string;
    }): object;
}
declare module "base/src/logging/Console" {
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
declare module "base/src/logging/Syslog" {
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
declare module "base/src/logging/JsonTCP" {
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
declare module "base/src/logging/logging" {
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
declare module "base/src/index" {
    import ConfigManager from "base/src/configManager/ConfigManager";
    import CertificateManager from "base/src/certificateManager/CertificateManager";
    import NonTLSCertificateManager from "base/src/certificateManager/NonTLSCertificateManager";
    import UIConfigService from "base/src/uiConfig/UiConfigService";
    import logger from "base/src/logging/logging";
    export { ConfigManager, CertificateManager, NonTLSCertificateManager, UIConfigService, logger };
}
declare module "database-pg/src/psql/DatabaseInitializer" {
    export default DatabaseInitializer;
    class DatabaseInitializer {
        /**
         * Sets basic fields.
         *
         * @param {object} options - Set of options.
         * @param {object} options.db - Username for the database.
         * @param {string} options.db.admin - Username of the database admin.
         * @param {string} options.db.adminPassword - Password of the database admin.
         * @param {Array} options.db.newUsers - The array of {user, password} entries, to be used to create new database users.
         * @param {string} options.db.database - Name of the database.
         * @param {string} options.db.host - Database host name.
         * @param {string} options.db.port - Database host port to connect to.
         * @param {Array} options.db.tableQueries - The array of the table creation queries.
         * @param {object} options.db.sslSettings - SSL settings used by the client.
         * @param {object} options.logger - Logger instance used by the DatabaseInitializer.
         * @param {object} [options.fMHandler] - FMHandler instance used by the DatabaseInitializer.
         */
        constructor(options: {
            db: {
                admin: string;
                adminPassword: string;
                newUsers: any[];
                database: string;
                host: string;
                port: string;
                tableQueries: any[];
                sslSettings: object;
            };
            logger: object;
            fMHandler?: object;
        });
        admin: string;
        adminPassword: string;
        newUsers: any[];
        host: string;
        port: string;
        database: string;
        tableQueries: any[];
        sslSettings: any;
        /**
         * Creates a user for the database.
         *
         * @param {object} client - Psql client object.
         * @param {string} username - Username.
         * @param {string} password - Password.
         */
        _createUser: (client: object, username: string, password: string) => Promise<void>;
        /**
         * Creates the database with the right owner.
         *
         * @param { object } client - Psql client object.
         * @param { string } DBName - DB name.
         * @param { string } DBOwner - DB owner.
         */
        _createDatabase: (client: object, DBName: string, DBOwner: string) => Promise<void>;
        /**
         * Grants the privileges to the user on the given database.
         *
         * @param { object } client - Psql client object.
         * @param { string } db - DB name.
         * @param { string } userName - DB user to grant privileges to.
         */
        _grantAllPrivileges: (client: object, db: string, userName: string, tableQueries: any) => Promise<void>;
        /**
         * Creates tables based on the given queries.
         *
         * @param { object } client - Psql client object.
         * @param { object } tableQueries - The map describing table creation queries - tableName: tablePath.
         */
        _createDBTablesInCustomDB: (client: object, tableQueries: object) => Promise<void>;
        _getConfig: (sslSettings: any) => any;
        /**
         * Establishes db connection.
         *
         * @param { object } config - Psql client config object.
         * @returns { Promise<object> } PostgreSQL client.
         */
        _createDBConnection: (config: object) => Promise<object>;
        /**
         * Initializes the whole database.
         */
        initDatabase: () => Promise<void>;
        [LOGGER]: any;
        [FM]: any;
    }
    const LOGGER: unique symbol;
    const FM: unique symbol;
}
declare module "database-pg/src/psql/DBClient" {
    export default class DBClient extends EventEmitter<[never]> {
        constructor(config: any);
        dbConnectConfig: any;
        connect(): Promise<any>;
        runQuery(query: any): Promise<any>;
        _pool: any;
        updateConnection(config: any): Promise<void>;
        close(): Promise<void>;
        [FM]: any;
        [LOGGER]: any;
    }
    import EventEmitter from "events";
    const FM: unique symbol;
    const LOGGER: unique symbol;
    export {};
}
declare module "database-pg/src/index" {
    import DatabaseInitializer from "database-pg/src/psql/DatabaseInitializer";
    import DBClient from "database-pg/src/psql/DBClient";
    export { DatabaseInitializer, DBClient };
}
declare module "faultHandler/src/schemas/faultIndication" {
    export default faultIndicationSchema;
    namespace faultIndicationSchema {
        let $schema: string;
        let id: string;
        let title: string;
        let description: string;
        let type: string;
        namespace properties {
            export namespace faultName {
                let description_1: string;
                export { description_1 as description };
                let type_1: string;
                export { type_1 as type };
                export let pattern: string;
            }
            export namespace serviceName {
                let description_2: string;
                export { description_2 as description };
                let type_2: string;
                export { type_2 as type };
                let pattern_1: string;
                export { pattern_1 as pattern };
            }
            export namespace faultyResource {
                let description_3: string;
                export { description_3 as description };
                let type_3: string;
                export { type_3 as type };
                export let minLength: number;
                export let maxLength: number;
            }
            export namespace severity {
                let description_4: string;
                export { description_4 as description };
                let type_4: string;
                export { type_4 as type };
                let _enum: string[];
                export { _enum as enum };
            }
            export namespace description_5 {
                let description_6: string;
                export { description_6 as description };
                let type_5: string;
                export { type_5 as type };
                let maxLength_1: number;
                export { maxLength_1 as maxLength };
            }
            export { description_5 as description };
            export namespace createdAt {
                let description_7: string;
                export { description_7 as description };
                let type_6: string;
                export { type_6 as type };
                export let format: string;
            }
            export namespace expiration {
                let description_8: string;
                export { description_8 as description };
                let type_7: string;
                export { type_7 as type };
                export let minimum: number;
            }
            export namespace additionalInformation {
                let description_9: string;
                export { description_9 as description };
                let type_8: string;
                export { type_8 as type };
            }
        }
        let required: string[];
        let additionalProperties: boolean;
    }
}
declare module "faultHandler/src/utils/faultIndicationService" {
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
    export function getFaultIndication({ fault, customConfig, serviceName, FI_DEFAULTS }: {
        fault: any;
        customConfig?: any;
        serviceName: any;
        FI_DEFAULTS: any;
    }): any | null;
}
declare module "faultHandler/src/schemas/faultManagerConfig" {
    export default faultManagerSchema;
    namespace faultManagerSchema {
        let $schema: string;
        let id: string;
        let title: string;
        let description: string;
        let type: string;
        namespace properties {
            namespace hostname {
                let description_1: string;
                export { description_1 as description };
                let type_1: string;
                export { type_1 as type };
            }
            namespace tlsPort {
                let description_2: string;
                export { description_2 as description };
                let type_2: string;
                export { type_2 as type };
            }
            namespace httpPort {
                let description_3: string;
                export { description_3 as description };
                let type_3: string;
                export { type_3 as type };
            }
            namespace serviceName {
                let description_4: string;
                export { description_4 as description };
                let type_4: string;
                export { type_4 as type };
            }
            namespace enabled {
                let description_5: string;
                export { description_5 as description };
                let type_5: string;
                export { type_5 as type };
            }
            namespace tls {
                let description_6: string;
                export { description_6 as description };
                let type_6: string;
                export { type_6 as type };
            }
        }
        let required: string[];
        let additionalProperties: boolean;
    }
}
declare module "faultHandler/src/schemas/faultIndicationMap" {
    export default faultIndicationMapSchema;
    namespace faultIndicationMapSchema {
        let $schema: string;
        let id: string;
        let title: string;
        let description: string;
        let type: string;
        namespace properties {
            export namespace faultName {
                let description_1: string;
                export { description_1 as description };
                let type_1: string;
                export { type_1 as type };
                export let pattern: string;
            }
            export namespace serviceName {
                let description_2: string;
                export { description_2 as description };
                let type_2: string;
                export { type_2 as type };
                let pattern_1: string;
                export { pattern_1 as pattern };
            }
            export namespace faultyResource {
                let description_3: string;
                export { description_3 as description };
                let type_3: string;
                export { type_3 as type };
                export let minLength: number;
                export let maxLength: number;
            }
            export namespace severity {
                let description_4: string;
                export { description_4 as description };
                let type_4: string;
                export { type_4 as type };
                let _enum: string[];
                export { _enum as enum };
            }
            export namespace description_5 {
                let description_6: string;
                export { description_6 as description };
                let type_5: string;
                export { type_5 as type };
                let maxLength_1: number;
                export { maxLength_1 as maxLength };
            }
            export { description_5 as description };
            export namespace expiration {
                let description_7: string;
                export { description_7 as description };
                let type_6: string;
                export { type_6 as type };
                export let minimum: number;
            }
            export namespace additionalInformation {
                let description_8: string;
                export { description_8 as description };
                let type_7: string;
                export { type_7 as type };
            }
        }
        let required: string[];
        let additionalProperties: boolean;
    }
}
declare module "faultHandler/src/fMHandler/fMHandler" {
    export default FaultHandler;
    class FaultHandler {
        /**
         * Initialize a FaultHandler.
         *
         * @param {object} options - Set of options.
         * @param {object} [options.logger] - The logger which will be used for logging.
         * @param {object} options.faultManagerConfig - Fault manager config.
         * @param {string} options.faultManagerConfig.clientId - Client ID.
         * @param {object} options.faultManagerConfig.tls - TLS configuration.
         * @param {boolean} options.faultManagerConfig.tls.enabled - True is TLS enabled.
         * @param {string} options.faultManagerConfig.hostname - Fault manager broker's hostname.
         * @param {string} options.faultManagerConfig.tlsPort - Fault manager tls port.
         * @param {string} options.faultManagerConfig.httpPort - Fault manager http port.
         * @param {string} options.faultManagerConfig.serviceName - Name of the service.
         * @param {boolean} options.faultManagerConfig.enabled - Sets if fault indications should be
         * produced.
         * @param {object} options.faultIndicationMap - Fault indication map. This map must be based on
         * Fault Indication JSON Schema, see
         * {@link https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-indication-schema-definition|details}.
         * @param {boolean} options.useHttps - True if https mode is used.
         * @param {object} options.tlsAgent - TLS agent for security connection.
         * @throws {Error} Configuration file for the faultHandler must be provided.
         * @throws {Error} Configuration file for the faultHandler must be consistent with the JSON
         * Schema.
         * @throws {Error} Fault indication map must be correct.
         * @throws {Error} Fault indication map must be consistent with the JSON Schema.
         */
        constructor(options: {
            logger?: object;
            faultManagerConfig: {
                clientId: string;
                tls: {
                    enabled: boolean;
                };
                hostname: string;
                tlsPort: string;
                httpPort: string;
                serviceName: string;
                enabled: boolean;
            };
            faultIndicationMap: object;
            useHttps: boolean;
            tlsAgent: object;
        });
        /**
         * Send fault indication to FI REST interface see
         * {@link https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/user-guide|link}
         * for details.
         *
         * @param {object} fIData - Fault indication metadata.
         * @param {string} fIData.fault - Alias for the fault, as per faultIndicationDefaultMap.
         * @param {object} fIData.customConfig - Additional parameters to override the defaults fault
         * indications.
         * @returns { Promise<object> } Response of FI REST endpoint.
         */
        produceFaultIndication(fIData: {
            fault: string;
            customConfig: object;
        }): Promise<object>;
        /**
         * Set fault manager config.
         *
         * @param {object} options - Set of options.
         * @param {object} [options.logger] - The logger which will be used for logging.
         * @param {object} options.faultManagerConfig - Fault manager config.
         * @param {boolean} options.useHttps - True if https mode is used.
         * @param {object} options.tlsAgent - TLS agent for security connection.
         * @throws {Error} If the fm config is missing.
         */
        setConfig({ logger, faultManagerConfig, useHttps, tlsAgent }: {
            logger?: object;
            faultManagerConfig: object;
            useHttps: boolean;
            tlsAgent: object;
        }): void;
        [FAULT_INDICATION_MAP]: any;
        [FAULT_MANAGER_CONFIG]: any;
        [PORT]: any;
        [PROTOCOL]: string;
        [TLS_AGENT]: any;
        [HOST_NAME]: any;
        [USE_HTTPS]: boolean;
        [LOGGER]: any;
        #private;
    }
    const FAULT_INDICATION_MAP: unique symbol;
    const FAULT_MANAGER_CONFIG: unique symbol;
    const PORT: unique symbol;
    const PROTOCOL: unique symbol;
    const TLS_AGENT: unique symbol;
    const HOST_NAME: unique symbol;
    const USE_HTTPS: unique symbol;
    const LOGGER: unique symbol;
}
declare module "faultHandler/src/index" {
    export { FaultHandler };
    import FaultHandler from "faultHandler/src/fMHandler/fMHandler";
}
declare module "kubernetes/src/constants" {
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
declare module "kubernetes/src/metrics/k8sResourceMetric" {
    export default K8sResourceMetric;
    /**
     * Class representing a resources metric.
     * @private
     * @extends events.EventEmitter
     */
    class K8sResourceMetric extends events<[never]> {
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
declare module "kubernetes/src/utils/waitUtil" {
    /**
     * Waits for given time in ms.
     *
     * @private
     * @param {number} ms - Time in ms.
     * @returns {Promise<void>}
     */
    export function wait(ms: number): Promise<void>;
}
declare module "kubernetes/src/k8sQuery/k8sQueryService" {
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
    class K8sQueryService extends events<[never]> {
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
    import K8sResourceMetric from "kubernetes/src/metrics/k8sResourceMetric";
    const FM: unique symbol;
    const PM: unique symbol;
    const LOGGER: unique symbol;
}
declare module "kubernetes/src/synchronization/synchronizationService" {
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
declare module "kubernetes/src/utils/schemaValidator" {
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
declare module "kubernetes/src/configQuery/configQueryService" {
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
declare module "kubernetes/src/manualConfigHandler/manualServiceConfigHandler" {
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
declare module "kubernetes/src/serviceCollection/serviceCollection" {
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
    import { SERVICE_EVENTS } from "kubernetes/src/constants";
    import { EventEmitter } from "events";
}
declare module "kubernetes/src/index" {
    import K8sQueryService from "kubernetes/src/k8sQuery/k8sQueryService";
    import SynchronizationService from "kubernetes/src/synchronization/synchronizationService";
    import ConfigQueryService from "kubernetes/src/configQuery/configQueryService";
    import ManualServiceConfigHandler from "kubernetes/src/manualConfigHandler/manualServiceConfigHandler";
    import ServiceCollection from "kubernetes/src/serviceCollection/serviceCollection";
    import { SERVICE_EVENTS } from "kubernetes/src/serviceCollection/serviceCollection";
    export { K8sQueryService, SynchronizationService, ConfigQueryService, ManualServiceConfigHandler, ServiceCollection, SERVICE_EVENTS };
}
declare module "license-manager/src/licenseManager/licenseManager" {
    export default LicenseManager;
    class LicenseManager {
        /**
         * Initialize a LicenseManager.
         *
         * @param {object} options - Set of options.
         * @param {object} [options.logger] - The logger which will be used for logging.
         * @param {object} options.licenseManagerConfig - License manager config.
         * @param {string} options.licenseManagerConfig.hostname - License manager hostname.
         * @param {string} options.licenseManagerConfig.tlsPort - License manager tls port.
         * @param {string} options.licenseManagerConfig.httpPort - License manager http port.
         * @param {string} options.licenseManagerConfig.productType - Product type of licenses
         * which should be checked.
         * @param {Array<object>} options.licenseManagerConfig.licenses - Array of licenses
         * which should be checked.
         * @param {boolean} options.useHttps - True if https mode is used.
         * @param {object} options.secureContext - Security context for security connection.
         * @param {object} options.tlsAgent - TLS agent for security connection.
         */
        constructor(options: {
            logger?: object;
            licenseManagerConfig: {
                hostname: string;
                tlsPort: string;
                httpPort: string;
                productType: string;
                licenses: Array<object>;
            };
            useHttps: boolean;
            secureContext: object;
            tlsAgent: object;
        });
        /**
         * Read detailed licenses information.
         *
         * @public
         * @async
         * @returns {Promise} Request promise.
         */
        public readLicensesInfo(): Promise<any>;
        /**
         * Set license manager config.
         *
         * @param {object} options - Set of options.
         * @param {object} [options.logger] - The logger which will be used for logging.
         * @param {object} options.licenseManagerConfig - License manager config.
         * @param {boolean} options.useHttps - True if https mode is used.
         * @param {object} options.secureContext - Security context for security connection.
         * @param {object} options.tlsAgent - TLS agent for security connection.
         */
        setLicenseManagerConfig({ logger, licenseManagerConfig, useHttps, secureContext, tlsAgent }: {
            logger?: object;
            licenseManagerConfig: object;
            useHttps: boolean;
            secureContext: object;
            tlsAgent: object;
        }): void;
        [LICENSE_MANAGER_CONFIG]: any;
        [LOGGER]: any;
        [USE_HTTPS]: boolean;
        [SECURE_CONTEXT]: any;
        [TLS_AGENT]: any;
    }
    const LICENSE_MANAGER_CONFIG: unique symbol;
    const LOGGER: unique symbol;
    const USE_HTTPS: unique symbol;
    const SECURE_CONTEXT: unique symbol;
    const TLS_AGENT: unique symbol;
}
declare module "license-manager/src/index" {
    export { LicenseManager };
    import LicenseManager from "license-manager/src/licenseManager/licenseManager";
}
declare module "pm-service/src/metrics/proxyHandlers" {
    /**
     * @private
     * @param {Object} logger
     * @returns {Object}
     */
    export function getHandlers(logger: any): any;
}
declare module "pm-service/src/pmService" {
    export default PmService;
    class PmService {
        /**
         * Performs initial setup of Prometheus client.
         *
         * @param {object} config - Set of configs.
         * @param {boolean} config.enabled - Enables/disables metric collection.
         * @param {string} config.appName - Application name, is used as metric name prefix.
         * @param {Array} [config.endpointsToCountRequests=[]] - Array of endpoints to count requests to.
         * @param {string} [config.endpointsPrefix="/"] - Common prefix of the endpoints to count requests to.
         * @param {object} [config.logger=SIMPLE_LOGGER] - Logger, if not provided, all log messages will
         * be sent to console.
         * @throws Will throw an error if `enabled` or `appName` is not passed.
         */
        constructor({ enabled, appName, logger, endpointsToCountRequests, endpointsPrefix, }: {
            enabled: boolean;
            appName: string;
            endpointsToCountRequests?: any[];
            endpointsPrefix?: string;
            logger?: object;
        });
        _metrics: Map<any, any>;
        _urlCounters: Map<any, any>;
        _urlResponseCounters: Map<any, any>;
        disabled: boolean;
        names: {};
        logger: any;
        counterHandler: any;
        gaugeHandler: any;
        counterEndpoints: string[];
        serviceName: string;
        serviceMetricPrefix: string;
        /**
         * Returns true if the service is enabled.
         *
         * @returns {boolean} On/Off state of the service.
         */
        isEnabled(): boolean;
        /**
         * Create metric of a given type.
         *
         * @param {string} metricType - Possible values are: 'counter' or 'gauge'.
         * @param {object} options - Metric parameters.
         * @param {string} options.name - Suffix part of metric name.
         * @param {string} options.help - Short description of a metric.
         * @param {Array} [options.labelNames] - List of label names.
         * @returns {object} Wrapper object for metric.
         */
        createMetric(metricType: string, options: {
            name: string;
            help: string;
            labelNames?: any[];
        }): object;
        /**
         * Delete a metric object by the suffix part of its name.
         *
         * @param {string} metricName - Inner metric name (without `appName` prefix).
         */
        deleteMetric(metricName: string): void;
        /**
         * Resets Prometheus common registry to it's initial state.
         */
        resetPromClient(): void;
        /**
         * Applies prom-bundle middleware to an app to setup metrics collection.
         * Recommended to apply this before metrics exposure middleware.
         *
         * @param {object} app - Express app.
         * @param {object} [options] - Middleware options.
         * See {@link https://www.npmjs.com/package/express-prom-bundle|link} for additional details.
         * @param {object} [options.promClient] - Prom client settings.
         * @param {object} [options.promClient.collectDefaultMetrics = {}] - Settings for collecting
         * default metrics, by default all are collected.
         */
        applyMetricsCollectionMiddleware(app: object, options?: {
            promClient?: {
                collectDefaultMetrics?: object;
            };
        }): void;
        /**
         * Applies prom-bundle middleware to an app to expose metrics to an endpoint.
         * Recommended to apply this after metrics collection middleware.
         *
         * @param {object} app - Express app for metrics endpoint.
         */
        applyMetricsExposureMiddleware(app: object): void;
        /**
         * Gracefully terminates `pmService`.
         */
        shutDown(): void;
    }
}
declare module "pm-service/src/index" {
    export { PmService as PerformanceMonitoring };
    import PmService from "pm-service/src/pmService";
}
declare module "telemetry/src/utils" {
    export function getAbsoluteUrl(req: any): string;
    export function isCompressed(headers: any): boolean;
    /**
     * Returns a sampler with a given default sampling rate.
     *
     * @param {number} defaultRatio - Default sampling rate.
     * @returns {object} Returns the custom sampler.
     */
    export function getRatioBaseSampler(defaultRatio: number): object;
}
declare module "telemetry/src/telemetry" {
    export default Telemetry;
    class Telemetry {
        /**
         * Performs initial setup of OpenTelemetry.
         *
         * @param { object } options - Initial parameters.
         */
        constructor(options?: object);
        tracer: import("@opentelemetry/api").Tracer;
        /**
         * Middleware function to add distributed tracing functionality to HTTP requests.
         *
         * @param {object} req - HTTP request object.
         * @param {object} res - HTTP response object.
         * @param {object} next - Callback function, will be called after the middleware is done.
         */
        tracingMiddleware(req: object, res: object, next: object): void;
        _spanKindServerId: SpanKind;
        _spanKindClientId: SpanKind;
        serviceName: any;
        /**
         * Refreshes the http(s) Agent of the exporter.
         *
         * @param {object} agent - New http(s) Agent with updated options.
         */
        refreshAgent(agent: object): void;
        /**
         * Sets a given ratio for the sampler based on config JSON.
         *
         * @param {*} dstConfig - The sampling config JSON.
         */
        refreshRatio(dstConfig: any): void;
        traceRatioSampler: any;
        exporter: OTLPTraceExporter;
        /**
         * Returns the numerical representation of spanKind Server.
         *
         * @returns {number} Return the spanKind Server id.
         */
        get spanKindServerId(): number;
        /**
         * Returns the numerical representation of spanKind Client.
         *
         * @returns {number} Return the spanKind Client id.
         */
        get spanKindClientId(): number;
        /**
         * Returns the trace id of the current active span.
         *
         * @returns {string} Return trace id of the current span.
         */
        getTraceId(): string;
        /**
         * Serialize the propagation fields from context into
         * an output object.
         *
         * @param {object} ctx - The context for serialize the propagation fields,
         * by default it's the active context.
         * @returns {object} Returns the carrier object.
         */
        injectContext(ctx?: object): object;
        /**
         * Extracts the propagation fields data into a context object.
         *
         * @param {object} req - HTTP request that contains the propagation fields.
         * @param {object} activeContext - A context for extracting the propagation fields into it,
         * by default it's the active context.
         * @returns {object} Returns the updated context.
         */
        extractContext(req: object, activeContext?: object): object;
        /**
         * Returns the initial semantic attributes of the span.
         *
         * @param {number} spanKind -  The kind of the Span which has these attributes.
         * @param {object} req - Request for the span.
         * @returns {object} Returns the attributes.
         */
        getHttpRequestSpanOptions(spanKind: number, req: object): object;
        /**
         * Sets HTTP response options for a span.
         *
         * @param {object} span - Span.
         * @param {object} res - Response for the span.
         */
        setHttpResponseSpanOptions(span: object, res: object): void;
        /**
         * Creates a span and sets context for it.
         *
         * @param {object} req - Request for creating a span from it.
         * @param {object} spanKind - SpanKind of the span.
         * @param {object} activeContext - A context where the span will be created,
         * by default it's the active context.
         * @returns {object} Returns the created span with its context.
         */
        createSpan(req: object, spanKind: object, activeContext?: object): object;
        #private;
    }
    import { SpanKind } from "@opentelemetry/api";
    import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http/build/src/platform/node/OTLPTraceExporter";
}
declare module "telemetry/src/index" {
    export default Telemetry;
    import Telemetry from "telemetry/src/telemetry";
}
declare module "ui-common/src/rest/rest" {
    export default Rest;
    /**
     * Class for performing api requests.
     *
     * @throws {HttpError}
     */
    class Rest {
        /**
         * Sets logger.
         *
         * @param {object} _logger - Logger instance.
         */
        setLogger(_logger: object): void;
        /**
         * Performs api request to the provided url.
         *
         * @async
         * @param {string} url - URL to make requests to.
         * @param {object} options - Additional request options (see fetch documentation).
         * @param {boolean} [logRequest=false] - Flag to distinguish whether request is for the logging
         * API.
         * @returns {Promise} Result of a successfull request or an error information.
         */
        makeRequest(url: string, options: object, logRequest?: boolean): Promise<any>;
        /**
         * @param {object} opts - Set of options.
         * @param {string} [opts.hostname ] - REST Hostname.
         * @param {string} [opts.path] - REST path.
         * @param {string} [opts.protocol] - REST protocol.
         */
        setBaseContext(opts: {
            hostname?: string;
            path?: string;
            protocol?: string;
        }): void;
        /**
         * @returns {string} Returns the base context.
         */
        getBaseContext(): string;
        [LOGGER]: any;
        [BASE_CONTEXT]: string;
    }
    const LOGGER: unique symbol;
    const BASE_CONTEXT: unique symbol;
}
declare module "ui-common/src/utils/schemaValidator" {
    export const schemaValidator: SchemaValidator;
    /**
     * Provides functionality to check the validity of given configurations
     * @private
     */
    class SchemaValidator {
        validator: Validator;
        /**
         * Checks the passed json with a given schema.
         *
         * @param {object} json - JSON object for validation.
         * @param {object} configSchema - Schema to validate object.
         * @returns {object} Result of validation.
         */
        validateConfig(json: object, configSchema: object): object;
    }
    import { Validator } from "jsonschema";
    export {};
}
declare module "ui-common/src/config/configManager" {
    export default ConfigManager;
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
        constructor({ defaultConfig, schema, path, logger }: {
            defaultConfig: object;
            schema: object;
            logger?: object;
            path?: string;
        });
        get config(): any;
        /**
         * Sets logger instance currently used by the class.
         *
         * @param {object} _logger - Instance of logger.
         */
        setLogger(_logger: object): void;
        getConfig(): Promise<any>;
        readConfigFile(): Promise<any>;
        initConfig(): Promise<any>;
        [DEFAULT_CONFIG]: any;
        [LOGGER]: any;
        [PATH]: string;
        [SCHEMA]: any;
        [CONFIG]: any;
    }
    const DEFAULT_CONFIG: unique symbol;
    const LOGGER: unique symbol;
    const PATH: unique symbol;
    const SCHEMA: unique symbol;
    const CONFIG: unique symbol;
}
declare module "ui-common/src/index" {
    import rest from "ui-common/src/rest/rest";
    import configManager from "ui-common/src/config/configManager";
    export { rest as Rest, configManager as ConfigManager };
}
declare module "utilities/src/network/networkUtil" {
    /**
     * Removes trailing slash from the input string, if present.
     *
     * @param {string} urlSegment - The input string.
     * @returns {string} Same string without the trailing slash, if there was one.
     */
    export function normalizeURLEnding(urlSegment: string): string;
    /**
     * Removes leading slash from the input string, if present.
     *
     * @param {string} urlSegment - The input string.
     * @returns {string} Same string without the leading slash, if there was one.
     */
    export function normalizeURLSegment(urlSegment: string): string;
    /**
     * Accepts a request and updates its body with url encoded formats.
     *
     * @param {object} request - Request object.
     * @returns {object} Request with updated body for form request.
     */
    export function parseJsonRequestBody(request: object): object;
    /**
     * A function for requesting data inside the kubernetes namespace.
     *
     * @param {object} params - A set of parameters.
     * @param {string} params.serviceName - The name of the service whose tlsAgent will be used for the request.
     * @param {string} params.protocol - The protocol that will be used either http or https.
     * @param {string} params.url - The url of the request to be sent.
     * @param {object} params.certificateManager - The instance of the CertificateManager that has the service's certificates.
     * @param {object} params.dstService - The instance of the DstService which will be used for telemetry.
     * @param {object} [params.headers] - Headers that will be added to the request.
     * @param {string} [params.method] - The HTTP method of the request.
     * @param {object} [params.body] - The body which needs to be sent with the request.
     *
     * @returns {Promise<object>} A promise that resolves to the Response object.
     */
    export function fetchResponsesForProtocol({ serviceName, protocol, url, certificateManager, dstService, headers, method, body, }: {
        serviceName: string;
        protocol: string;
        url: string;
        certificateManager: object;
        dstService: object;
        headers?: object;
        method?: string;
        body?: object;
    }): Promise<object>;
}
declare module "utilities/src/logging/loggerUtil" {
    /**
     * Get the logger instance to output error messages. If no logger has been passed, console.log
     * will be used by default.
     *
     * @private
     * @param {object} [logger] - Logger instance.
     * @returns {object} Logger instance.
     */
    export function getLogger(logger?: object): object;
}
declare module "utilities/src/index" {
    import * as networkUtil from "utilities/src/network/networkUtil";
    import { getLogger } from "utilities/src/logging/loggerUtil";
    export { networkUtil, getLogger };
}
