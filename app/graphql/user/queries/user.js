import _ from 'lodash';
import { defaultArgs } from 'graphql-sequelize';
import config from 'config';

import { models } from '../../../lib/db';
import resolver from '../../../lib/graphql/resolver';
import GraphQLTypeUser from '../types/user';
import { adminUsers, allUsers } from '../../../constants/roles';

const { User } = models;

const before = (findOptions, args, { req: { user } }) => {
  // Restrict result by default for own user
  let restrict = { id: user.id };

  // Restrict result for admins for own organization
  if (adminUsers.includes(user.role)) restrict = { organization: user.organization };

  // Create final where
  findOptions.where = { ...findOptions.where, ...restrict };

  return findOptions;
};

export default {
  type: GraphQLTypeUser,
  acl: { userSession: true, roles: allUsers },
  args: defaultArgs(User),
  resolve: resolver(User, _.merge({}, config.util.cloneDeep(config.get('graphql.resolverOptions')), { before })),
};
