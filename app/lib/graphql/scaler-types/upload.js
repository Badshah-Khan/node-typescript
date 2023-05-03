import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'Upload',
  description:
    'The `Upload` scalar type represents a file upload promise that resolves ' +
    'an object containing `stream`, `filename`, `mimetype` and `encoding`.',
  parseValue: value => value,
  parseLiteral() {
    throw error('Upload scalar literal unsupported');
  },
  serialize() {
    throw error('Upload scalar serialization unsupported');
  },
});
