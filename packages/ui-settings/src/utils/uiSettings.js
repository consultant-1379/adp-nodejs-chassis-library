// @ts-ignore
import { getLogger } from '@adp/utilities/loggerUtil';
import BrowserStorage from '../storage/browserStorage/browserStorage.js';
import DBStorage from '../storage/dbStorage/dbStorage.js';
import CONSTANTS from '../config/constants.js';

const { STORAGE_MODE } = CONSTANTS;

/**
 * Class to manage UI Settings.
 */
class UISettings {
  /**
   * @param {object} config - Init config.
   * @param {BroadcastChannel} config.broadcastChannel - The broadcastChannel instance.
   * @param {string} config.username - The name of the user.
   * @param {string} config.storageMode - Mode of the storage, uiSettingsService or localStorage.
   * @param {string} [config.baseUrl] - Base URL of the UIS Service.
   * @param {object} [config.logger] - Logger.
   */
  constructor({ username, broadcastChannel, storageMode, baseUrl, logger }) {
    this.broadcastChannel = broadcastChannel;
    this.logger = getLogger(logger);
    this.#validateStorageMode(storageMode);

    this.storage =
      storageMode === STORAGE_MODE.UI_SETTINGS_SERVICE
        ? new DBStorage({ baseUrl, logger: this.logger })
        : new BrowserStorage(username);
  }

  #validateStorageMode(storageMode) {
    if (
      storageMode !== STORAGE_MODE.UI_SETTINGS_SERVICE &&
      storageMode !== STORAGE_MODE.LOCAL_STORAGE
    ) {
      this.logger.error(
        `Invalid storage mode: ${storageMode}! The storage mode can be '${STORAGE_MODE.UI_SETTINGS_SERVICE}' or '${STORAGE_MODE.LOCAL_STORAGE}'.`,
      );
    }
  }

  #sendMessage({ storageKey, value, oldValue }) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        storageKey,
        newValue: value,
        oldValue,
      });
    }
  }

  /**
   * Get an item from localStorage saved per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   * @returns {Promise<any>} The value of the given key found in the storage per user.
   */
  async get(params) {
    return this.storage.getItem(params);
  }

  /**
   * Save an item into the localStorage per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   * @param {*} params.value - The value of the given key.
   */
  async set(params) {
    const { namespace, key, value } = params;

    const oldValue = await this.get(params);
    await this.storage.setItem(params);
    this.#sendMessage({ storageKey: { namespace, key }, value, oldValue });
  }

  /**
   * Removes the key-value pair from localStorage if exist per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   */
  async remove(params) {
    await this.storage.removeItem(params);
  }
}

export default UISettings;
