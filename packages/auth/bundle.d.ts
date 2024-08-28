declare module "schemas/tokenParserConfigSchema" {
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
declare module "config/defaultTokenParserConfig" {
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
declare module "cookieParser/validationError" {
    export default ValidationError;
    class ValidationError extends Error {
        constructor(message: any, parseErrors: any);
        parseErrors: any;
    }
}
declare module "cookieParser/cookieParser" {
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
declare module "cookieParser/authTokenParser" {
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
declare module "cookieParser/cookieParserMiddleware" {
    export function getCookieParserMiddleware(authTokenParserConfig: any): (req: any, res: any, next: any) => any;
}
declare module "config/constants" {
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
declare module "utils/dateFormatter" {
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
declare module "cookieParser/authHandler" {
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
declare module "iam/UserInfo" {
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
declare module "userpermission/userPermissionHandler" {
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
declare module "index" {
    import AuthTokenParser from "cookieParser/authTokenParser";
    import AuthHandler from "cookieParser/authHandler";
    import IamUserInfo from "iam/UserInfo";
    import dateFormatter from "utils/dateFormatter";
    import userPermissionHandler from "userpermission/userPermissionHandler";
    import { getCookieParserMiddleware } from "cookieParser/cookieParserMiddleware";
    import { parseSingleCookieByName } from "cookieParser/cookieParser";
    export { AuthTokenParser, AuthHandler, IamUserInfo, dateFormatter, userPermissionHandler, getCookieParserMiddleware, parseSingleCookieByName };
}
