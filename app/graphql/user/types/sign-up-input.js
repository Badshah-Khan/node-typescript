import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const GraphQLTypeSignUpInput = new GraphQLInputObjectType({
  name: 'SignUpInput',
  description: 'A SignUpInput',
  fields: () => ({
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    }
  }),
});

export default GraphQLTypeSignUpInput;
