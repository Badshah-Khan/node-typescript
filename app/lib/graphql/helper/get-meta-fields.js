import { GraphQLNonNull, GraphQLInt } from 'graphql';

function getMetaFields() {
  return {
    count: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  };
}

export default getMetaFields;
