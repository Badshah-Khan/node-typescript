import { GraphQLNonNull } from 'graphql';
import config from 'config';

import { models } from '../../../lib/db';
import { jwtSignAsync } from '../../../lib/utils/jwt-async';
import GraphQLTypeSession from '../../../lib/graphql/shared-types/session';
import GraphQLTypeLoginInput from '../types/login-input';

const Sequelize = require('sequelize');

const { User, Session } = models;

export default {
  type: GraphQLTypeSession,
  acl: { userSession: false },
  args: {
    input: {
      type: new GraphQLNonNull(GraphQLTypeLoginInput),
    },
  },
  async resolve(source, { input }, { req, res }) {
    let loginSuccessful = false;
    const { email, password, rememberDevice } = input;

    const foundUser = await User.findOne({
      where: { email: { [Sequelize.Op.iLike]: email } },
    });

    let user = null;
    if (foundUser) {
      user = foundUser;
    }

    // Check password
    if (user) {
      loginSuccessful = await User.comparePassword(user.password, password);
    }

    // Only return this one error message in order to prevent an insight into the system through testing or brute force attacks
    if (foundUser && !foundUser.isActive) throw error('login:error-membership-deactivated', 'USER_DEACTIVATED');

    if (!loginSuccessful) throw error('login:error-general-wrong-credentials', 'WRONG_CREDENTIALS');

    const userData = await User.getJSONData(user.id, true, config.get('graphql.fieldOptions.exclude'));

    const { refreshToken, sessionId } = await Session.save(req, userData.json, rememberDevice);
    const token = await jwtSignAsync({ ...userData.json, sessionId }, config.get('security.jwtSecret'), {
      expiresIn: config.get('sessions.expires.tokenLifeTime'),
      algorithm: config.get('security.jwtAlgorithm'),
    });
    
    return {
      token,
      refreshToken,
      user: userData.org,
    };
  },
};
