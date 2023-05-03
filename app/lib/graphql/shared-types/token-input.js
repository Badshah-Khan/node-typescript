import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const GraphQLTypeTokenInput = new GraphQLInputObjectType({
  name: 'TokenInput',
  description: 'A Token Input',
  fields: () => ({
    token: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export default GraphQLTypeTokenInput;
