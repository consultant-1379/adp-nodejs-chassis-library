import dateFormatter from '../utils/dateFormatter.js';
import { parseSingleCookieByName } from './cookieParser.js';
import AuthTokenParser from './authTokenParser.js';
import defaultTokenParserConfig from '../config/defaultTokenParserConfig.js';
import CONSTANTS from '../config/constants.js';

const { DEFAULT_USERNAME, DEFAULT_LAST_LOGIN_TIME_KEY, ALTERNATIVE_LAST_LOGIN_KEY } = CONSTANTS;

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
  constructor({
    cookies,
    defaultUsername = DEFAULT_USERNAME,
    lastLoginTimeKey = DEFAULT_LAST_LOGIN_TIME_KEY,
    tokenParserConfig = defaultTokenParserConfig,
  }) {
    this.defaultUsername = defaultUsername;
    this.lastLoginTimeKey = lastLoginTimeKey;
    this.cookies = cookies;
    this.tokenParserConfig = tokenParserConfig;
  }

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
  getUsername() {
    const authTokenParser = new AuthTokenParser(this.tokenParserConfig);
    this.jwtData = authTokenParser.getJWTPayload(this.cookies);
    return this.jwtData?.userName || this.defaultUsername;
  }

  /**
   * Parsing last login time or authentication time from cookies.
   *
   * @returns {string | undefined} Retrieved last login time or authentication time or undefined if the input is invalid.
   * @memberof AuthHandler
   */
  getAuthTime() {
    const lastLoginTime = parseSingleCookieByName(this.lastLoginTimeKey, this.cookies);
    const parsedAuthTime = lastLoginTime
      ? dateFormatter.convertISODate(lastLoginTime)
      : parseSingleCookieByName(ALTERNATIVE_LAST_LOGIN_KEY, this.cookies);

    return !parsedAuthTime || dateFormatter.isInputInvalid(parsedAuthTime)
      ? undefined
      : dateFormatter.getIsoString(parsedAuthTime);
  }
}

export default AuthHandler;
