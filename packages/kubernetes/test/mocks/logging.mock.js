const testMode = process.env.NODE_ENV === 'test';
const logging = {
  getLogger() {
    if (testMode) {
      return {
        info: () => null,
        warn: () => null,
        debug: () => null,
        error: () => null,
      };
    }
    return {
      info: (...args) => console.info(args),
      warn: (...args) => console.warn(args),
      debug: (...args) => console.debug(args),
      error: (...args) => console.error(args),
    };
  },
  addConfigListener: () => null,
};

export default logging;
