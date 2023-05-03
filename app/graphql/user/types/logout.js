import { GraphQLObjectType, GraphQLString } from 'graphql';

const GraphQLTypeLogout = new GraphQLObjectType({
  name: 'Logout',
  description: 'A Logout',
  fields: () => ({
    result: {
      type: GraphQLString,
    },
  }),
});

export default GraphQLTypeLogout;
