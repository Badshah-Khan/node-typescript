import { GraphQLList } from 'graphql';
import config from 'config';

import { models } from '../../../lib/db';
import defaultListArgs from '../../../lib/graphql/helper/default-list-args';
import resolver from '../../../lib/graphql/resolver';
import GraphQLTypeSessionData from '../types/session-data';
import { allUsers } from '../../../constants/roles';

const { Session } = models;

export default {
  type: new GraphQLList(GraphQLTypeSessionData),
  acl: { userSession: true, roles: allUsers },
  args: defaultListArgs(),
  resolve: resolver(Session, config.util.cloneDeep(config.get('graphql.resolverOptions'))),
  // addMeta: {
  //   model: Session,
  // },
};
