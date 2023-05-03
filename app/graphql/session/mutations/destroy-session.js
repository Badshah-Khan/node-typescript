import { GraphQLNonNull, GraphQLString } from 'graphql';

import { models } from '../../../lib/db';
import GraphQLTypeSessionData from '../types/session-data';
import { allUsers } from '../../../constants/roles';

const { Session } = models;

export default {
  type: GraphQLTypeSessionData,
  acl: { userSession: true, roles: allUsers },
  args: {
    sessionId: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  async resolve(source, { sessionId }, { req: { user } }) {
    if (!user) throw error('common:error-general-unauthorized', 'UNAUTHORIZED');
    const session = await Session.findOne({
      where: { sessionId },
    });
    if (!session) throw error('session:error-not-found', 'NOT_FOUND');

    await Session.destroyBySessionId(sessionId);

    return session;
  },
};
