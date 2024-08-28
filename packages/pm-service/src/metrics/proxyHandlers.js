/**
 * @private
 * @param {Object} logger
 * @returns {Object}
 */
function getHandlers(logger) {
  const counterHandler = {
    get(target, prop) {
      if (prop === 'inc') {
        // default value to value argument were added to pass sonarqube check
        return (param = {}, value = null) => {
          value = value ?? undefined;
          if (Number(value) === value || value === undefined) {
            target[prop](param, value);
          } else {
            logger.error(`Counter metric has got an invalid value`);
          }
        };
      }

      if (prop === 'reset') {
        return target[prop];
      }

      return undefined;
    },
  };

  const gaugeHandler = {
    get(target, prop) {
      const changeValueMethods = ['set', 'inc', 'dec'];
      if (changeValueMethods.includes(prop)) {
        // default value to value argument were added to pass sonarqube check
        return (param = {}, value = null) => {
          // prom-client doesn't allow null for gauge 'set', 'inc', 'dec'
          value = value ?? undefined;
          if (Number(value) === value || value === undefined) {
            target[prop](param, value);
          } else {
            logger.error(`Gauge metric has got an invalid value`);
          }
        };
      }

      if (prop === 'reset') {
        return target[prop];
      }

      return undefined;
    },
  };

  return {
    counterHandler,
    gaugeHandler,
  };
}

export { getHandlers };
