import _ from 'lodash';
import { GraphQLList, GraphQLNonNull } from 'graphql';
import graphql from 'graphql-sequelize';
// import { isConnection, handleConnection, nodeType } from 'graphql-sequelize/lib/relay';
import { EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import assert from 'assert';
import Promise from 'bluebird';

const { argsToFindOptions, relay } = graphql;
const { isConnection, handleConnection, nodeType } = relay

function whereQueryVarsToValues(o, vals) {
  [...Object.getOwnPropertyNames(o), ...Object.getOwnPropertySymbols(o)].forEach(k => {
    if (_.isFunction(o[k])) {
      o[k] = o[k](vals);
      return;
    }
    if (_.isObject(o[k])) {
      whereQueryVarsToValues(o[k], vals);
    }
  });
}

function checkIsModel(target) {
  return !!target.getTableName;
}

function checkIsAssociation(target) {
  return !!target.associationType;
}

function resolverFactory(targetMaybeThunk, options = {}) {
  assert(
    typeof targetMaybeThunk === 'function' || checkIsModel(targetMaybeThunk) || checkIsAssociation(targetMaybeThunk),
    `resolverFactory should be called with a model,
     an association or a function (which resolves to a model or an association)`
  );

  const contextToOptions = _.assign({}, resolverFactory.contextToOptions, options.contextToOptions);

  assert(options.include === undefined, 'Include support has been removed in favor of dataloader batching');
  if (options.before === undefined) options.before = ioptions => ioptions;
  if (options.after === undefined) options.after = result => result;
  if (options.handleConnection === undefined) options.handleConnection = true;

  return async function resolve(source, args, context = {}, info) {
    const target =
      typeof targetMaybeThunk === 'function' && !checkIsModel(targetMaybeThunk)
        ? await Promise.resolve(targetMaybeThunk(source, args, context, info))
        : targetMaybeThunk;

    const isModel = checkIsModel(target);
    const isAssociation = checkIsAssociation(target);
    const association = isAssociation && target;
    const model = (isAssociation && target.target) || (isModel && target);
    let type = info.returnType;

    const list =
      options.list ||
      type instanceof GraphQLList ||
      (type instanceof GraphQLNonNull && type.ofType instanceof GraphQLList);
    const { count } = options;

    const targetAttributes = Object.keys(model.rawAttributes);
    const findOptions = argsToFindOptions(args, targetAttributes);

    const fullInfo = {
      ...info,
      type,
      source,
      target,
    };

    if (isConnection(type)) {
      type = nodeType(type);
    }

    type = type.ofType || type;

    findOptions.attributes = targetAttributes;
    findOptions.logging = findOptions.logging || context.logging;
    findOptions[EXPECTED_OPTIONS_KEY] = context[EXPECTED_OPTIONS_KEY];

    // Todo: Find out why the data loader is not working
    // console.log('contextToOptions', contextToOptions);

    _.each(contextToOptions, (as, key) => {
      // console.log('as', as, 'key', key);
      findOptions[as] = context[key];
    });

    return Promise.resolve(options.before(findOptions, args, context, fullInfo))
      .then(ifindOptions => {
        if (args.where && !_.isEmpty(fullInfo.variableValues)) {
          whereQueryVarsToValues(args.where, fullInfo.variableValues);
          whereQueryVarsToValues(ifindOptions.where, fullInfo.variableValues);
        }

        if (list && !ifindOptions.order) {
          ifindOptions.order = [[model.primaryKeyAttribute, 'ASC']];
        }

        if (association) {
          if (source[association.as] !== undefined) {
            // The user did a manual include
            const result = source[association.as];
            if (options.handleConnection && isConnection(fullInfo.returnType)) {
              return handleConnection(result, args);
            }

            return result;
          }

          return source[association.accessors.get](ifindOptions).then(result => {
            if (options.handleConnection && isConnection(fullInfo.returnType)) {
              return handleConnection(result, args);
            }
            return result;
          });
        }

        if (count) {
          ifindOptions.attributes = [];
        }

        // Todo: Find out why the data loader is not working
        // console.log('ifindOptions', ifindOptions);

        return model[count ? 'count' : list ? 'findAll' : 'findOne'](ifindOptions);
      })
      .then(result => options.after(result, args, context, fullInfo));
  };
}

resolverFactory.contextToOptions = {};

export default resolverFactory;
