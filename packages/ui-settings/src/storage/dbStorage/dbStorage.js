import { Rest } from '@adp/ui-common';

import CONSTANTS from '../../config/constants.js';

const { UI_SETTINGS_ROUTE } = CONSTANTS;

const rest = new Rest();

/**
 * Class to manage UI Settings in DB mode.
 */
class DBStorage {
  /**
   * @param {object} config - Init config.
   * @param {string} config.baseUrl - Base URL of the UIS Service.
   * @param {object} [config.logger] - Logger.
   */
  constructor({ baseUrl = '', logger }) {
    this.logger = logger;

    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl;
    rest.setBaseContext({ path: `${formattedBaseUrl}${UI_SETTINGS_ROUTE}` });
  }

  #getSettingKey(namespace, key) {
    return `/user/${namespace}/${key}`;
  }

  // Don't send 4xx errors to logger
  #logError(error) {
    const errorCode = error.response?.status;
    if (!(errorCode >= 400 && errorCode < 500)) {
      this.logger.error(error);
    }
  }

  async #makeRequest({ namespace, key }, options) {
    const settingKey = this.#getSettingKey(namespace, key);

    try {
      const response = await rest.makeRequest(settingKey, options);
      return response?.value;
    } catch (error) {
      this.#logError(error);
      return null;
    }
  }

  /**
   * Get the setting for a user from the storage.
   *
   * @param {object} params - Needed parameters for the get() method.
   * @param {string} params.namespace - The namespace of the setting.
   * @param {string} params.key - The identifier of the setting.
   * @returns {Promise<any>} The value of the given key found in the storage per user.
   */
  async getItem(params) {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    return this.#makeRequest(params, options);
  }

  /**
   * Save the setting for a user into the storage.
   *
   * @param {object} params - Needed parameters for the set() method.
   * @param {string} params.namespace - The namespace of the setting.
   * @param {string} params.key - The identifier of the setting.
   * @param {*} params.value - The value of the given setting.
   */
  async setItem({ namespace, key, value }) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ value }),
    };

    await this.#makeRequest({ namespace, key }, options);
  }

  /**
   * Removes the setting for a user from the storage if exist.
   *
   * @param {object} params - Needed parameters for the remove() method.
   * @param {string} params.namespace - The namespace of the setting.
   * @param {string} params.key - The identifier of the setting.
   */
  async removeItem(params) {
    const options = {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    };

    await this.#makeRequest(params, options);
  }
}

export default DBStorage;
