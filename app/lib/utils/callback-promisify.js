import Promise from 'bluebird';

/**
 *
 * @param {function} fn
 * @param {object} options
 * @returns {function(...[*]): Promise<unknown>}
 */
const callbackPromisify =
  (fn, options = {}) =>
  (...params) =>
    new Promise((resolve, reject) =>
      options.complex
        ? fn(...[...params, (...callbackParams) => resolve(callbackParams)])
        : fn(...[...params, (err, data) => (err ? reject(err) : resolve(data))])
    );

export default callbackPromisify;