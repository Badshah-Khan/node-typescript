import { GraphQLBoolean, GraphQLNonNull } from 'graphql';

import { models } from '../../../lib/db';
import GraphQLTypeEmailInput from '../../../lib/graphql/shared-types/email-input';

const { User } = models;

export default {
  type: GraphQLBoolean,
  acl: { userSession: false },
  args: {
    input: {
      type: new GraphQLNonNull(GraphQLTypeEmailInput),
    },
  },
  async resolve(source, { input: { email } }, { req: { clientIp } }) {
    const hasUser = await User.findOne({ where: { email } });

    // Only if email has a user...
    // if (hasUser) {
    //   await UserPasswordReset.create({
    //     email,
    //     requestIp: clientIp,
    //     user: hasUser.id,
    //   });
    // }

    // Always return success to prevent insights into the system
    return true;
  },
};
