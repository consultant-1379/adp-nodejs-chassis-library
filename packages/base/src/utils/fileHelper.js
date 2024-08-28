import chokidar from 'chokidar';

/**
 * Watch a file or directory for changes and invoke a function when it changes.
 * @private
 * @param {string|string[]} filepaths - Path or paths to files or directories to be watched for changes
 * @param {Function} func - A function to invoke when the file path changes
 * @param {Object} logger - Logger instance to output messages
 * @returns {Object} - An fs object
 */
function watchFile(filepaths, func, logger) {
  return chokidar
    .watch(filepaths, { awaitWriteFinish: true })
    .on('add', () => {
      logger.debug(`Added ${filepaths}`);
      func();
    })
    .on('change', () => {
      logger.debug(`Change in ${filepaths}`);
      func();
    })
    .on('error', (error) => {
      logger.error('Unable to watch file.', error);
    });
}

/**
 * Stops watching a chokidar file.
 * @private
 * @param {object} chokidarObj - The watcher object that needs to be stopped
 * @param {Object} logger - Logger instance to output messages
 */
function stopFileWatch(chokidarObj, logger) {
  chokidarObj.close().then(() => {
    logger.info(`Manual config file change listener closed`);
  });
}

export { watchFile, stopFileWatch };
