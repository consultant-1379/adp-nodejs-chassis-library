import { jwtDecode } from 'jwt-decode';
// @ts-ignore
import { fetchResponsesForProtocol } from '@adp/utilities/networkUtil';
import { parseSingleCookieByName } from '../cookieParser/cookieParser.js';
import defaultTokenParserConfig from '../config/defaultTokenParserConfig.js';
import CONSTANTS from '../config/constants.js';

const { LOGIN_TIME_PARSED_TOKEN_KEY, USER_AUTH_REALM_KEY, DEFAULT_IAM_TLS_PORT } = CONSTANTS;

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
  constructor({
    iamConfig,
    certificateManager,
    telemetryService,
    tokenParserConfig = defaultTokenParserConfig,
  }) {
    this.iamConfig = iamConfig;
    this.certificateManager = certificateManager;
    this.telemetryService = telemetryService;
    this.tokenParserConfig = tokenParserConfig;
  }

  /**
   * Retrieves user name from IAM.
   *
   * @param {AuthOptions} options - Set of options.
   * @returns {Promise<object>} `userName` property contains username according
   * to the `fieldMappings` and `responseKeys` configurations. `error` property
   * fills if the request isn't successfull.
   * @throws {Error} Throws Error if token don't pass the check or request to the IAM fails.
   */
  async getUsername(options) {
    const { responseKeys } = this.iamConfig || {};
    const userInfo = await this.fetchData(options);
    return userInfo?.[responseKeys?.userNameKey];
  }

  /**
   * Retrieves user information from IAM.
   *
   * @param {AuthOptions} options - Set of options.
   * @returns {Promise<object>} `userInfo` property contains fetched data in addition
   * to the fields normalized by `fieldMappings` configuration. `error` property fills
   * if the request isn't successfull.
   * @throws {Error} Throws Error if token don't pass the check or request to the IAM fails.
   */
  async fetchData(options) {
    const { cookie } = options || {};
    const { serviceName, realmName, protocol } = this.iamConfig || {};
    let error;
    let userInfo;

    try {
      this.authHeaderCheck(options);

      const { parsedToken, bearerToken } = this.#getTokens(options);
      const url = new URL(parsedToken.iss);
      const headers = {
        Authorization: `Bearer ${bearerToken}`,
        Host: url.hostname,
        Accept: 'application/json',
      };

      const determinedRealmName =
        realmName || parseSingleCookieByName(USER_AUTH_REALM_KEY, cookie) || '';
      const determinedUrl = this.#getUserInfoUrl(determinedRealmName);

      const userInfoResponse = await fetchResponsesForProtocol({
        serviceName,
        protocol: protocol || 'https',
        url: determinedUrl,
        certificateManager: this.certificateManager,
        dstService: this.telemetryService,
        headers,
      });

      if (!userInfoResponse.ok) {
        const requestError = new Error();
        // @ts-ignore
        requestError.status = userInfoResponse.status;

        throw requestError;
      } else {
        const rawUserInfo = await userInfoResponse.json();

        userInfo = this.#mapUserInfo({
          rawUserInfo,
          defaultLastLoginTime: parsedToken[LOGIN_TIME_PARSED_TOKEN_KEY],
        });
      }
    } catch (err) {
      err.status = err.status || 500;
      error = err;
    }

    if (error) {
      throw error;
    }

    return userInfo;
  }

  /**
   * Checks access token.
   *
   * @param {AuthOptions} options - Set of options.
   * @throws {Error} Throws Error if the token from cookies or authorization isn't valid.
   */
  authHeaderCheck(options) {
    const { cookie, authorization } = options || {};
    const { JWT_NAME } = this.tokenParserConfig;
    if (!authorization && !cookie?.includes(JWT_NAME)) {
      const authError = new Error(
        'Missing authentication details. Provide access token in the Authentication header or via cookie!',
      );
      // @ts-ignore
      authError.status = 401;
      throw authError;
    }
  }

  /**
   * Retrieves parsed and Bearer tokens.
   *
   * @param {AuthOptions} options - Set of options.
   * @returns {object} Parsed token and token to request IAM.
   */
  #getTokens(options) {
    const { cookie, authorization } = options || {};
    const { JWT_DELIMITTER, JWT_NAME } = this.tokenParserConfig;
    const token = authorization?.includes('Bearer')
      ? authorization.split(';')[0].match(/(?<=Bearer ).*/)[0]
      : parseSingleCookieByName(JWT_NAME, cookie);

    const bearerToken = token
      .split(JWT_DELIMITTER)
      .filter((tokenPart) => !tokenPart.includes('='))
      .join(JWT_DELIMITTER);
    const parsedToken = jwtDecode(bearerToken);

    return {
      parsedToken,
      bearerToken,
    };
  }

  #getUserInfoUrl(realmName) {
    const {
      iamServiceName,
      hostName,
      tlsPort = DEFAULT_IAM_TLS_PORT,
      nonTLSMode,
    } = this.iamConfig || {};

    return `${
      nonTLSMode ? hostName : `${iamServiceName}-http:${tlsPort}`
    }/auth/realms/${realmName}/protocol/openid-connect/userinfo`;
  }

  /**
   * Normalizes user information fetched from IAM .
   *
   * @param {object} options - Parameters.
   * @param {object} [options.rawUserInfo] - User data returned by IAM.
   * @param {string} options.defaultLastLoginTime - Default last login time.
   *
   * @returns {object} `rawUserInfo` extended with normalized fields.
   */
  #mapUserInfo({ rawUserInfo = {}, defaultLastLoginTime }) {
    const { fieldMappings = {}, responseKeys = {} } = this.iamConfig || {};
    const { userNameKey, userIdKey, loginTimeKey } = responseKeys;
    const mappedUserInfo = Object.entries(fieldMappings).reduce((result, [propName, altKeys]) => {
      const propAltKey = altKeys.find((key) => !!rawUserInfo[key]);
      if (propAltKey) {
        result[propName] = rawUserInfo[propAltKey];
      }
      return result;
    }, {});
    const lastLoginTimeValue = mappedUserInfo[loginTimeKey] || defaultLastLoginTime;

    return {
      ...rawUserInfo,
      ...(mappedUserInfo[userNameKey] && { [userNameKey]: mappedUserInfo[userNameKey] }),
      ...(mappedUserInfo[userIdKey] && { [userIdKey]: mappedUserInfo[userIdKey] }),
      ...(lastLoginTimeValue && { [loginTimeKey]: lastLoginTimeValue }),
    };
  }
}

export default IamUserInfo;
