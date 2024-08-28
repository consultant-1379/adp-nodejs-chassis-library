declare module "licenseManager/licenseManager" {
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
declare module "index" {
    export { LicenseManager };
    import LicenseManager from "licenseManager/licenseManager";
}
