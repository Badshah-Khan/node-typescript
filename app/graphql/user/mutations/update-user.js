import { GraphQLNonNull, GraphQLID } from 'graphql';

import _ from 'lodash';
import { models } from '../../../lib/db';
import GraphQLTypeUserType from '../types/user';
import GraphQLTypeUserInput from '../types/user-input';
import { adminUsers, UserRoles } from '../../../constants/roles';

const { User } = models;

export default {
  type: GraphQLTypeUserType,
  acl: { userSession: true, roles: adminUsers },
  args: {
    id: {
      type: GraphQLID,
    },
    input: {
      type: new GraphQLNonNull(GraphQLTypeUserInput),
    },
  },
  async resolve(source, { id, input }, { req: { user } }) {
    const systemAdminsRoles = [UserRoles.SYSTEMADMIN, UserRoles.OWNER];
    const userToUpdate = await User.findById(id);

    if (!user) throw error('common:error-general-unauthorized', 'UNAUTHORIZED');
    if (user.role !== UserRoles.ADMIN && user.role !== UserRoles.SYSTEMADMIN)
      throw error('common:error-general-not-allowed', 'NOT_ALLOWED');

    if (
      (systemAdminsRoles.includes(userToUpdate.role) || systemAdminsRoles.includes(input.role)) &&
      !systemAdminsRoles.includes(user.role)
    ) {
      throw error('common:error-general-not-allowed', 'NOT_ALLOWED');
    }

    const finalInput = _.omitBy(input, _.isNil);

    const data = { ...userToUpdate, ...finalInput };

    // Update user type
    const upsertedUserType = await User.UpdateUserType(id, data, { userToUpdate });

    return upsertedUserType;
  },
};
