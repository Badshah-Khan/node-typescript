import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const GraphQLTypeEmailInput = new GraphQLInputObjectType({
  name: 'EmailInput',
  description: 'A Email Input',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export default GraphQLTypeEmailInput;
