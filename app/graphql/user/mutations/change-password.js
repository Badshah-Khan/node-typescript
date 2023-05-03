import { GraphQLNonNull } from 'graphql';
import config from 'config';

import { models } from '../../../lib/db';
import GraphQLTypeSession from '../../../lib/graphql/shared-types/session';
import { jwtSignAsync } from '../../../lib/utils/jwt-async';
import GraphQLTypeChangePasswordInput from '../types/change-password-input';
import { allUsers } from '../../../constants/roles';

const { User } = models;

export default {
  type: GraphQLTypeSession,
  acl: { userSession: true, roles: allUsers },
  args: {
    input: {
      type: new GraphQLNonNull(GraphQLTypeChangePasswordInput),
    },
  },
  async resolve(source, { input }, { req: { user } }) {
    if (!user) throw error('common:error-general-unauthorized', 'UNAUTHORIZED');

    const { oldPassword, newPassword } = input;
    const updatedUser = await User.changePassword(user.id, oldPassword, newPassword);

    const userData = await User.getJSONData(updatedUser.id, true, config.get('graphql.fieldOptions.exclude'));
    const token = await jwtSignAsync(userData.json, config.get('security.jwtSecret'), {
      algorithm: config.get('security.jwtAlgorithm'),
    });
    return {
      token,
      user: userData.org,
    };
  },
};
