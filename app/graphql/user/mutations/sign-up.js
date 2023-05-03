import { GraphQLNonNull } from 'graphql';
import config from 'config';

import { models } from '../../../lib/db';
import { jwtSignAsync, jwtVerifyAsync } from '../../../lib/utils/jwt-async';
import GraphQLTypeSession from '../../../lib/graphql/shared-types/session';
import GraphQLTypeSignUpInput from '../types/sign-up-input';
// import { clearCookie } from '../../../lib/helpers/clearCookie';
// import RuleQueue from '../../../workers/queues/rule-queue';

const Sequelize = require('sequelize');

const { User, Session } = models;

export default {
  type: GraphQLTypeSession,
  acl: { userSession: false },
  args: {
    input: {
      type: new GraphQLNonNull(GraphQLTypeSignUpInput),
    },
  },
  async resolve(source, { input }, { req, res }) {
    const { email } = input;

    // const { refreshToken, sessionId } = await Session.save(req, userData.json);
    // const token = await jwtSignAsync({ ...userData.json, sessionId }, config.get('security.jwtSecret'), {
    //   expiresIn: config.get('sessions.expires.tokenLifeTime'),
    //   algorithm: config.get('security.jwtAlgorithm'),
    // });

    const user = await User.findOne({ where: { email: { [Sequelize.Op.iLike]: email } } });

    return {
      token,
      refreshToken,
      user: user,
    };
  },
};
