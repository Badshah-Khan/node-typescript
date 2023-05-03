import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const GraphQLTypeResetPasswordInput = new GraphQLInputObjectType({
  name: 'ResetPasswordInput',
  description: 'A Reset Password Input',
  fields: () => ({
    token: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export default GraphQLTypeResetPasswordInput;
