/**
 *
 * How to use:
 *
 * const add = fn => v => fn(v + 1);
 * const rem = fn => v => fn(v - 1);
 * const calc = compose(add, rem)(v => v);
 * console.log('COMPOSE: ', calc(1));
 *
 * @link https://medium.com/@dtipson/creating-an-es6ish-compose-in-javascript-ac580b95104a
 *
 * @param args
  @return {function(*=): (|any)}
 */

  export default (...args) =>
  initial =>
    args.reduceRight((result, fn) => fn(result), initial);