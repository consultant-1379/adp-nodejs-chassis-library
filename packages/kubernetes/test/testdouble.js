import * as td from 'testdouble';

/**
 * This config provides the possibility to extend default testdouble module
 * and add additional methods.
 *
 * @param {function} spyProp - This function provides the possibility to mock method
 * and call real method when mocked method is called. If spyProp method is called then
 * td.when method can't be called anymore for mocked function.
 * If td.when functionality is necessary then td.func, td.replace or td.when().thenDo methods could be used
 * for configuring calling real method.
 */

export default {
  ...td,
  spyProp(object, propName) {
    if (typeof object?.[propName] === 'function') {
      const originalProp = object[propName].bind(object);
      const stub = td.func();
      object[propName] = (...args) => {
        stub(...args);
        return originalProp(...args);
      };
      return stub;
    }
    return undefined;
  },
};
