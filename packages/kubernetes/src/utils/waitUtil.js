/**
 * Waits for given time in ms.
 *
 * @private
 * @param {number} ms - Time in ms.
 * @returns {Promise<void>}
 */
export function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
