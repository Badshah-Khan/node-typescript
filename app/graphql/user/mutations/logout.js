import GraphQLTypeLogout from '../types/logout';
// import { clearCookie } from '../../../lib/helpers/clearCookie';

import { models } from '../../../lib/db';
import { allUsers } from '../../../constants/roles';

const { Session } = models;

export default {
  type: GraphQLTypeLogout,
  acl: { userSession: true, roles: allUsers },
  args: {},
  async resolve(source, args, { req: { user }, res }) {
    if (!user) throw error('common:error-general-unauthorized', 'UNAUTHORIZED');
    const { sessionId } = user;

    await Session.destroyBySessionId(sessionId);
    // clearCookie(res);

    return { result: 'User successfully logged out' };
  },
};
