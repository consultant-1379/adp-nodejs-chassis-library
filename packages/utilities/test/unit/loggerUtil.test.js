import { expect } from 'chai';
import { getLogger } from '../../src/logging/loggerUtil.js';
import td from '../../../../scripts/testdouble.js';

const LOGGER_METHODS = {
  error: 'error',
  warn: 'warning',
  info: 'info',
  debug: 'debug',
};
const FUNC = 'function';

const LOGGER_MOCK = {
  error() {
    return true;
  },
  info() {
    return true;
  },
  warning() {
    return true;
  },
  debug() {
    return true;
  },
};

describe('Unit tests for loggerUtil.js', () => {
  describe('Testing Logger functions', () => {
    const { error, info, warn, debug } = LOGGER_METHODS;
    it('should return default logger', () => {
      const logger = getLogger();
      expect(logger).not.to.be.undefined;
      expect(typeof logger[error]).to.eq(FUNC);
      expect(typeof logger[info]).to.eq(FUNC);
      expect(typeof logger[warn]).to.eq(FUNC);
      expect(typeof logger[debug]).to.eq(FUNC);
    });
    it('should call logger instance methods', () => {
      const logger = getLogger(LOGGER_MOCK);
      expect(logger).not.to.be.undefined;
      const logErrorCall = td.spyProp(logger, error);
      logger.error(error);
      td.verify(logErrorCall(), { ignoreExtraArgs: true, times: 1 });
      const logInfoCall = td.spyProp(logger, info);
      logger.info(info);
      td.verify(logInfoCall(), { ignoreExtraArgs: true, times: 1 });
      const logWarnCall = td.spyProp(logger, warn);
      logger.warning(warn);
      td.verify(logWarnCall(), { ignoreExtraArgs: true, times: 1 });
      const logDebugCall = td.spyProp(logger, debug);
      logger.debug(debug);
      td.verify(logDebugCall(), { ignoreExtraArgs: true, times: 1 });
    });
  });
});
