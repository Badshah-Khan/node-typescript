import _ from 'lodash';
import { GraphQLObjectType } from 'graphql';
import config from 'config';

import attributeFields from '../../../lib/graphql/helper/attribute-fields';
import { models } from '../../../lib/db';

const { User } = models;

const GraphQLTypeUser = new GraphQLObjectType({
  name: 'User',
  description: 'A User',
  fields: () =>
    _.merge({}, attributeFields(User, config.get('graphql.fieldOptions')))
});

export default GraphQLTypeUser;
