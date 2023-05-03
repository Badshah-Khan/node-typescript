import jwt from 'jsonwebtoken';
import Promise from 'bluebird';

import callbackPromisify from './callback-promisify.js';

/**
 *
 * Promisified jwt functions
 */
export const jwtSignAsync = callbackPromisify(jwt.sign, [null, null, {}]);
export const jwtVerifyAsync = Promise.promisify(jwt.verify);