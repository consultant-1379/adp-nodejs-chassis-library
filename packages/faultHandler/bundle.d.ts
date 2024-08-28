declare module "schemas/faultIndication" {
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
declare module "utils/faultIndicationService" {
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
declare module "schemas/faultManagerConfig" {
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
declare module "schemas/faultIndicationMap" {
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
declare module "fMHandler/fMHandler" {
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
declare module "index" {
    export { FaultHandler };
    import FaultHandler from "fMHandler/fMHandler";
}
