declare module "rest/rest" {
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
declare module "utils/schemaValidator" {
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
declare module "config/configManager" {
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
declare module "index" {
    import rest from "rest/rest";
    import configManager from "config/configManager";
    export { rest as Rest, configManager as ConfigManager };
}
