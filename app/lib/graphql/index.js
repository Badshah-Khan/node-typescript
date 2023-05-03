import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import mapKeysDeep from 'map-keys-deep-lodash';
import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLSchema } from 'graphql';
import config from 'config';

import defaultMetaArgs from '../../lib/graphql/helper/default-meta-args';
import getMetaFields from '../../lib/graphql/helper/get-meta-fields';
import resolver from '../../lib/graphql/resolver';

// import logger from '../logger';

const graphQLPath = path.resolve(__dirname, '../../', 'graphql');
const graphQLPathExists = fs.existsSync(graphQLPath);

const fields = {};
const acl = {};

const getACL = (operationName, graphql) => {
  // Quit app If the Graphql endpoint miss the acl
  if (!graphql.acl) {
    console.log(`ACL_MISSING: ${operationName} is missing acl`);
    process.exit(99);
  }

  acl[operationName] = graphql.acl;
};

// Require related query files
let qra = {};
if (graphQLPathExists) {
  // eslint-disable-next-line global-require
  qra = require('require-all')({
    dirname: graphQLPath,
    filter: f => {
      if (!f.match(/^.+?\.js$/) || f.match(/^index\.js$/)) return false;
      return path.basename(f, '.js');
    },
    map: (name, p) => {
      const dArr = path.dirname(p).replace(/\//g, path.sep).split(path.sep);
      const d = dArr.length ? dArr[dArr.length - 1] : null;
      const f = path.basename(p);

      if (d !== 'queries' || !f.match(/^.+?\.js$/)) return name;

      return `GraphQLQuery-${_.camelCase(path.basename(f, '.js'))}`;
    },
    recursive: true,
  });
}

// Find queries in related query files
const queryMetas = [];
const queries = {};
mapKeysDeep(qra, (v, k) => {
  const kMatch = k.match(/GraphQLQuery-(.+?)$/);

  if (kMatch && kMatch[1] && _.isObject(v.default)) {
    queries[kMatch[1]] = v.default;
    getACL(kMatch[1], v.default);
    // Add meta queries?
    if (queries[kMatch[1]].type && queries[kMatch[1]].addMeta && queries[kMatch[1]].addMeta.model) {
      const { type } = queries[kMatch[1]];
      const list =
        type instanceof GraphQLList || (type instanceof GraphQLNonNull && type.ofType instanceof GraphQLList);

      if (!list) {
        console.log(
          `Could not create Meta Query for Query "${kMatch[1]}". Meta Queries are only supported for Lists.`
        );
        process.exit(99);
      }
      // queryMetas.push(_.merge({}, queries[kMatch[1]].addMeta, { name: kMatch[1] }));
    }
  }

  return k;
});

// // Add meta queries if needed
if (queryMetas.length) {
  queryMetas.forEach(o => {
    const metaName = `${o.name}Meta`;
    if (!queries[metaName]) {
      const finalResolverOptions = _.merge(
        {},
        !o.resolverOptions ? config.util.cloneDeep(config.get('graphql.resolverOptions')) : o.resolverOptions,
        {
          count: true,
          after: (count, args, context) => {
            const afterBefore = _.isFunction(o.after) ? o.after(count, args, context) : {};

            return _.merge({}, afterBefore, { count });
          },
        }
      );

      if (o.before) {
        finalResolverOptions.before = o.before;
      }

      // Add Meta ACL based on the Operation.
      getACL(metaName, { acl: acl[o.name] });
      queries[metaName] = {
        type: new GraphQLObjectType({
          name: metaName,
          description: `${o.name} Meta Data`,
          fields: () => getMetaFields(),
        }),
        args: defaultMetaArgs(),
        resolve: resolver(o.model, finalResolverOptions),
      };
    }
  });
}


// Include queries
const query = new GraphQLObjectType({
  name: 'Query',
  fields: _.size(queries)
    ? Object.keys(queries)
        .sort()
        .reduce((list, key) => ({ ...list, [key]: queries[key] }), {})
    : {
        _: {
          type: GraphQLString,
        },
      },
});
fields.query = query;

// Require related mutation files
let mra = {};
if (graphQLPathExists) {
  // eslint-disable-next-line global-require
  mra = require('require-all')({
    dirname: graphQLPath,
    filter: f => {
      if (!f.match(/^.+?\.js$/) || f.match(/^index\.js$/)) return false;
      return path.basename(f, '.js');
    },
    map: (name, p) => {
      const dArr = path.dirname(p).replace(/\//g, path.sep).split(path.sep);
      const d = dArr.length ? dArr[dArr.length - 1] : null;
      const f = path.basename(p);

      if (d !== 'mutations' || !f.match(/^.+?\.js$/)) return name;

      return `GraphQLMutation-${_.camelCase(path.basename(f, '.js'))}`;
    },
    recursive: true,
  });
}

// Find mutations in related mutation files
const mutations = {};
mapKeysDeep(mra, (v, k) => {
  const kMatch = k.match(/GraphQLMutation-(.+?)$/);

  if (kMatch && kMatch[1] && _.isObject(v.default)) {
    mutations[kMatch[1]] = v.default;
    getACL(kMatch[1], v.default);
  }

  return k;
});

// Include mutations
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: _.size(mutations)
    ? Object.keys(mutations)
        .sort()
        .reduce((list, key) => ({ ...list, [key]: mutations[key] }), {})
    : {
        _: {
          type: GraphQLString,
        },
      },
});
fields.mutation = mutation;

// Create and export GraphQL Schema
export default new GraphQLSchema(fields);

export { acl };
