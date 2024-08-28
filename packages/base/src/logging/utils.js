function parseProtocol(protocol) {
  switch (protocol) {
    case 'tcp':
    case 'tcp4':
      return { type: 'tcp', family: 4 };

    case 'tcp6':
      return { type: 'tcp', family: 6 };

    case 'tls':
    case 'tls4':
      return { type: 'tls', family: 4 };

    case 'tls6':
      return { type: 'tls', family: 6 };

    default:
      throw new Error(`Invalid syslog protocol: ${protocol}`);
  }
}

function isObject(item) {
  return (
    item &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    Object.getPrototypeOf(item) === Object.prototype
  );
}

/**
 * Function merges recursively two objects.
 *
 * @param {object} [baseObj={}] - Initial base object.
 * @param {object} [obj={}] - Object to be merged.
 * @returns {object} Resulting object.
 */
function mergeObj(baseObj = {}, obj = {}) {
  const resultingObj = { ...baseObj, ...obj };

  Object.keys(obj).forEach((item) => {
    if (isObject(obj[item])) {
      resultingObj[item] = mergeObj(baseObj[item], obj[item]);
    }
  });

  return resultingObj;
}

export { parseProtocol, mergeObj };
