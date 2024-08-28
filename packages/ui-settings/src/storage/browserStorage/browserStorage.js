/**
 * Class to manage UI Settings in localStorage mode.
 */
class BrowserStorage {
  /**
   * @param {string} username - The name of the user.
   */
  constructor(username) {
    this.username = username;
  }

  #getStorageKey(namespace, key) {
    return `${this.username}/${namespace}/${key}`;
  }

  /**
   * Get an item from localStorage saved per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   * @returns {*} The value of the given key found in localStorage per user.
   */
  getItem({ namespace, key }) {
    const storageKey = this.#getStorageKey(namespace, key);
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : item;
  }

  /**
   * Save an item into the localStorage per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   * @param {*} params.value - The value of the given key.
   */
  setItem({ namespace, key, value }) {
    const storageKey = this.#getStorageKey(namespace, key);
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  /**
   * Removes the key-value pair from localStorage if exist per user.
   *
   * @param {object} params - Parameters.
   * @param {string} params.namespace - The namespace of the item.
   * @param {string} params.key - The identifier of the item.
   */
  removeItem({ namespace, key }) {
    const storageKey = this.#getStorageKey(namespace, key);
    localStorage.removeItem(storageKey);
  }
}

export default BrowserStorage;
