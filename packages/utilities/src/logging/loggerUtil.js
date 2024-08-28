const LOGGER_METHODS = {
  error: 'error',
  warn: 'warning',
  info: 'info',
  debug: 'debug',
};
const silent = process?.env.NODE_ENV === 'test';

const log = (msg, type = 'log') => {
  if (!silent) {
    console[type](msg);
  }
};

/**
 * Get the logger instance to output error messages. If no logger has been passed, console.log
 * will be used by default.
 *
 * @private
 * @param {object} [logger] - Logger instance.
 * @returns {object} Logger instance.
 */
function getLogger(logger) {
  const isLoggerValid = logger && logger.error && logger.info && logger.warning && logger.debug;
  let _logger;

  if (isLoggerValid) {
    _logger = logger;
  } else {
    const { error, info, warn, debug } = LOGGER_METHODS;
    log(
      'The logger was not passed or it is missing some methods. Default console.log will be used.',
    );
    _logger = {
      error(message) {
        log(`ERROR: ${message}`, error);
      },
      info(message) {
        log(`INFO: ${message}`, info);
      },
      warning(message) {
        log(`WARNING: ${message}`, warn);
      },
      debug(message) {
        log(`DEBUG: ${message}`, debug);
      },
    };
  }

  return _logger;
}

export { getLogger };
