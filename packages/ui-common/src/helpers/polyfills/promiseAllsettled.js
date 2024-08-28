/**
 * Checks if Promise.allsettled is available in the test runner environment. If not, it sets a polyfill.
 */
(function addPromiseAllSettled() {
  if (!Promise.allSettled) {
    Promise.allSettled = (promises) =>
      Promise.all(
        promises.map((promise) =>
          Promise.resolve(promise).then(
            (value) => ({
              status: 'fulfilled',
              value,
            }),
            (reason) => ({
              status: 'rejected',
              reason,
            }),
          ),
        ),
      );
  }
})();
