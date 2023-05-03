import _ from 'lodash';
import { GraphQLNonNull, GraphQLEnumType } from 'graphql';
import { globalIdField } from 'graphql-relay';
import pkg from 'graphql-sequelize';
import config from 'config';

import { db } from '../../db.js';

const { graphQLCache } = db;
const {typeMapper} = pkg;

const DEFAULT_EXCLUDES = ['_meta'];

function attributeFields(Model, options, extraExcludes, mode = 'output') {
  let finalOptions = {};
  if (options) {
    finalOptions = config.util.cloneDeep(options);
  }

  if (_.isArray(extraExcludes) && extraExcludes.length) {
    if (_.isArray(finalOptions.exclude)) {
      finalOptions.exclude = finalOptions.exclude.concat(extraExcludes);
    } else {
      finalOptions.exclude = extraExcludes;
    }
  }

  if (_.isArray(DEFAULT_EXCLUDES) && DEFAULT_EXCLUDES.length) {
    if (_.isArray(finalOptions.exclude)) {
      finalOptions.exclude = finalOptions.exclude.concat(DEFAULT_EXCLUDES);
    } else {
      finalOptions.exclude = DEFAULT_EXCLUDES;
    }
  }

  finalOptions.cache = graphQLCache;
  console.log("model attribute");
  const cache = finalOptions.cache || {};
  const result = Object.keys(Model.rawAttributes).reduce((memo, key) => {
    let memoKey = key;
    if (finalOptions.exclude) {
      if (typeof finalOptions.exclude === 'function' && finalOptions.exclude(memoKey)) return memo;
      if (Array.isArray(finalOptions.exclude) && finalOptions.exclude.includes(memoKey)) return memo;
    }
    if (finalOptions.only) {
      if (typeof finalOptions.only === 'function' && !finalOptions.only(memoKey)) return memo;

      if (Array.isArray(finalOptions.only) && !finalOptions.only.includes(memoKey)) return memo;
    }

    const attribute = Model.rawAttributes[memoKey];
    const { type } = attribute;

    // Attribute exclude possibilities
    if (attribute.exclude === true) return memo;
    if (_.isObject(attribute.exclude) && attribute.exclude[mode] === true) return memo;

    if (finalOptions.map) {
      memoKey = finalOptions.map[memoKey] || memoKey;
    }

    memo[memoKey] = {
      type: typeMapper.toGraphQL(type, Model.sequelize.constructor),
    };

    if (memo[memoKey].type instanceof GraphQLEnumType) {
      const typeName = `${Model.name}${memoKey}EnumType`;
      /*
      Cache enum types to prevent memoKeyduplicate type name error
      when calling attributeFields multiple times on the same model
      */
      if (cache[typeName]) {
        memo[memoKey].type = cache[typeName];
      } else {
        memo[memoKey].type.name = typeName;
        cache[typeName] = memo[memoKey].type;
      }
    }

    if (!finalOptions.allowNull) {
      if (attribute.allowNull === false || attribute.primaryKey === true) {
        memo[memoKey].type = new GraphQLNonNull(memo[memoKey].type);
      }
    }

    if (finalOptions.commentToDescription) {
      if (typeof attribute.comment === 'string') {
        memo[memoKey].description = attribute.comment;
      }
    }

    return memo;
  }, {});

  if (finalOptions.globalId) {
    result.id = globalIdField(Model.name, instance => instance[Model.primaryKeyAttribute]);
  }

  return result;
}

export default attributeFields;
