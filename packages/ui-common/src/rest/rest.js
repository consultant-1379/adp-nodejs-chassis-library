/* eslint max-classes-per-file: ["error", 2] */

const REST_CONFIG = Symbol('REST_CONFIG');
const LOGGER = Symbol('LOGGER');
const BASE_CONTEXT = Symbol('BASE_CONTEXT'); // the relative path from the container context to the rest apis

class HttpError extends Error {
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

const URL_REGEXP =
  /^(http|https)?:\/\/(www\.)?(([-a-zA-Z0-9@:%._+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()!@:%_+~#?&/=.]*)))$/;

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
  setLogger(_logger) {
    this[LOGGER] = _logger;
  }

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
  async makeRequest(url, options, logRequest = false) {
    if (this[BASE_CONTEXT] === undefined) {
      this.setBaseContext(null);
    }

    const response = await this.fetchResponse(`${this[BASE_CONTEXT]}${url}`, options, logRequest);
    const responseText = await response.text();
    try {
      return JSON.parse(responseText);
    } catch (_err) {
      return responseText;
    }
  }

  /**
   * Wrapper for the fetch, provides additional logging and error handling.
   * Performs requests without altering neither url, nor result.
   *
   * @async
   * @param {string} url - URL to make requests to.
   * @param {object} options - Additional request options (see fetch documentation).
   * @param {boolean} [logRequest=false] - Flag to distinguish whether request is for the logging
   * API.
   * @returns {Promise} Result of a successfull request or an error information.
   * @throws {HttpError}
   */
  async fetchResponse(url, options, logRequest = false) {
    const response = await fetch(url, options);
    // @ts-ignore
    if (response.ok && !response.isSessionExpired) {
      return response;
    }
    if (logRequest) {
      // we cannot log the error through the logging service, if logging service itself is unavailable
      console.error(`Sending log event failed: ${JSON.stringify(response)}
            Logevent: ${JSON.stringify(options.body)}`);
    } else if (this[LOGGER]) {
      this[LOGGER].error(response);
    }
    throw new HttpError(response);
  }

  /**
   * @param {object} opts - Set of options.
   * @param {string} [opts.hostname ] - REST Hostname.
   * @param {string} [opts.path] - REST path.
   * @param {string} [opts.protocol] - REST protocol.
   */
  setBaseContext(opts) {
    if (!opts?.hostname && !opts?.path) {
      this[BASE_CONTEXT] = '..';
      return;
    }
    const { hostname, path, protocol } = opts;
    const pathUsed = path && path.endsWith('/') ? path.slice(0, path.length - 1) : path;
    if (!hostname) {
      this[BASE_CONTEXT] = pathUsed;
      return;
    }
    const url = `${protocol}://${hostname}${pathUsed}`;
    if (URL_REGEXP.test(url)) {
      this[BASE_CONTEXT] = url;
    } else {
      this[BASE_CONTEXT] = '';
      const error = `Base URL ${url} is invalid, falling back to default`;
      if (this[LOGGER]) {
        this[LOGGER].error(error);
      }
      console.log(error);
    }
  }

  /**
   * @returns {string} Returns the base context.
   */
  getBaseContext() {
    if (this[BASE_CONTEXT] === undefined) {
      this.setBaseContext(this[REST_CONFIG]);
    }
    return this[BASE_CONTEXT];
  }
}

export default Rest;
