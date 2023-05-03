import _ from 'lodash';
import pkg from 'graphql-sequelize';
import { GraphQLInt, GraphQLString } from 'graphql';
import config from 'config';

const { JSONType } = pkg;

function defaultListArgs(excludeArgs = [], defaultLimit) {
  const limit = parseInt(
    !_.isUndefined(defaultLimit)
      ? defaultLimit
      : config.has('app.lists.defaultLimit')
      ? config.get('app.lists.defaultLimit')
      : 10,
    10
  );

  const args = {
    limit: {
      type: GraphQLInt,
    },
    order: { type: GraphQLString },
    where: {
      type: JSONType.default,
      description:
        'A JSON object conforming the the shape specified in http://docs.sequelizejs.com/en/latest/docs/querying/',
    },
    offset: { type: GraphQLInt },
  };

  if (limit > 0) {
    args.limit.defaultValue = limit;
  }

  if (excludeArgs && excludeArgs.length) {
    excludeArgs.forEach(excludeArg => {
      if (args[excludeArg]) {
        delete args[excludeArg];
      }
    });
  }

  return args;
}

export default defaultListArgs;
