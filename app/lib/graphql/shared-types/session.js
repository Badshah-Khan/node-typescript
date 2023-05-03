import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

import GraphQLTypeUser from '../../../graphql/user/types/user.js';

const GraphQLTypeSession = new GraphQLObjectType({
  name: 'Session',
  description: 'A Session',
  fields: () => ({
    token: {
      type: new GraphQLNonNull(GraphQLString),
    },
    refreshToken: {
      type: new GraphQLNonNull(GraphQLString),
    },
    user: {
      type: new GraphQLNonNull(GraphQLTypeUser),
    },
  }),
});

export default GraphQLTypeSession;
