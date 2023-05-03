import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const GraphQLTypeChangePasswordInput = new GraphQLInputObjectType({
  name: 'ChangePasswordInput',
  description: 'A ChangePasswordInput',
  fields: () => ({
    oldPassword: {
      type: new GraphQLNonNull(GraphQLString),
    },
    newPassword: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export default GraphQLTypeChangePasswordInput;
