import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';

const GraphQLTypeLoginInput = new GraphQLInputObjectType({
  name: 'LoginInput',
  description: 'A LoginInput',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    rememberDevice: {
      type: GraphQLBoolean,
    },
  }),
});

export default GraphQLTypeLoginInput;
