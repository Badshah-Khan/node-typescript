import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLString } from 'graphql';

const GraphQLTypeUserInput = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'A UserInput',
  fields: () => ({
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    role: {
      type: GraphQLString,
    },
    isActive: {
      type: GraphQLBoolean,
    },
    timezone: {
      type: GraphQLString,
    },
    userType: {
      type: GraphQLInt,
    },
  }),
});

export default GraphQLTypeUserInput;
