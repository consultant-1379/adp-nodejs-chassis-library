/**
 * Extracts cookie with provided name from cookies string.
 * Cookies are supposed to be separated with "; ".
 *
 * @param {string} name - Cookie name that holds jwt.
 * @param {string} rawCookies - Cookies to be processed.
 * @returns {string} Extracted cookie. Still encoded though.
 */
function parseSingleCookieByName(name, rawCookies) {
  const value = `; ${rawCookies}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

export { parseSingleCookieByName };
