import { GraphQLNonNull } from 'graphql';
import config from 'config';

import { models } from '../../../lib/db';
import { jwtSignAsync } from '../../../lib/utils/jwt-async';
import GraphQLTypeSession from '../../../lib/graphql/shared-types/session';
import GraphQLTypeResetPasswordInput from '../types/reset-password-input';

const { User, Session } = models;

export default {
  type: GraphQLTypeSession,
  acl: { userSession: false },
  args: {
    input: {
      type: new GraphQLNonNull(GraphQLTypeResetPasswordInput),
    },
  },
  async resolve(source, { input: { token: restoreToken, password } }, { req, res }) {
    const { clientIp } = req;
    const updatedUser = await User.resetPassword(restoreToken, password, clientIp);

    const userData = await User.getJSONData(updatedUser.id, true, config.get('graphql.fieldOptions.exclude'));
    const { refreshToken, sessionId } = await Session.save(req, userData.json);
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
