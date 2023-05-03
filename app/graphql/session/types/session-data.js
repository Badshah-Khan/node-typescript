import _ from 'lodash';
import { GraphQLObjectType } from 'graphql';
import config from 'config';

import attributeFields from '../../../lib/graphql/helper/attribute-fields';
import { models } from '../../../lib/db';

const { Session } = models;

const GraphQLTypeSessionData = new GraphQLObjectType({
  name: 'SessionData',
  description: 'A SessionData',
  fields: () => _.merge({}, attributeFields(Session, config.get('graphql.fieldOptions'))),
});

export default GraphQLTypeSessionData;
