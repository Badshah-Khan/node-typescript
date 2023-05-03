import config from 'config';

import baseResolver from './helper/base-resolver.js';
import authResolver from './auth-resolver.js';
import compose from '../compose.js';

function resolver(Model, options) {
  const beforeDefault = (findOptions, args, context) => {
    const appListsBefore = config.has('app.lists.before') ? config.get('app.lists.before') : null;

    // If we have a app lists before, use it
    if (appListsBefore) {
      return appListsBefore(Model, findOptions, args, context);
    }

    return findOptions;
  };

  if (options && options.needAuthorization) {
    return compose(authResolver)((...iArgs) => {
      // Check if the client wants a list
      const list =
        iArgs[3] &&
        iArgs[3].returnType &&
        iArgs[3].returnType.constructor &&
        iArgs[3].returnType.constructor.name === 'GraphQLList';

      // If the client wants a list, make sure that a maximum limit is not exceeded
      if (list && iArgs[1] && typeof iArgs[1] === 'object') {
        const maxLimit = config.has('app.lists.maxLimit') ? config.get('app.lists.maxLimit') : 1000;

        if (!iArgs[1].limit || iArgs[1].limit < 0 || iArgs[1].limit > maxLimit) {
          iArgs[1].limit = maxLimit;
        }
      }

      return baseResolver(Model, { before: beforeDefault, ...options })(...iArgs);
    });
  }

  return baseResolver(Model, options);
}

export default resolver;
