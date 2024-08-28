import dateFormatter from '../utils/dateFormatter.js';
import { parseSingleCookieByName } from '../cookieParser/cookieParser.js';
import CONSTANTS from '../config/constants.js';

const { DEFAULT_USERNAME, ALTERNATIVE_LAST_LOGIN_KEY, LAST_LOGIN_TIME_KEY, USER_NAME_KEY } =
  CONSTANTS;

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
  init({ cookies, userInfo, usernameKey = USER_NAME_KEY, lastLoginTimeKey = LAST_LOGIN_TIME_KEY }) {
    this.cookies = cookies;
    this.userInfo = userInfo;
    this.usernameKey = usernameKey;
    this.lastLoginTimeKey = lastLoginTimeKey;
  }

  /**
   * Returns username or the default value (single space);.
   *
   * @returns {string} Retrieved username.
   */
  getUsername() {
    return this.userInfo[this.usernameKey] || DEFAULT_USERNAME;
  }

  /**
   * Parsing last login time from the permission endpoint or
   * reading alternative auth solution login time from cookie.
   *
   * @returns {string | undefined} Retrieved last login time or authentication time or undefined if the input is invalid.
   */
  getAuthTime() {
    const lastLoginTimeText = this.userInfo[this.lastLoginTimeKey]
      ? dateFormatter.convertISODate(this.userInfo[this.lastLoginTimeKey])
      : parseSingleCookieByName(ALTERNATIVE_LAST_LOGIN_KEY, this.cookies);

    return !lastLoginTimeText || dateFormatter.isInputInvalid(lastLoginTimeText)
      ? undefined
      : dateFormatter.getIsoString(lastLoginTimeText);
  }
}

export default new UserPermissionHandler();
