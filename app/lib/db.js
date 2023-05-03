import Sequelize, { DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import _ from 'lodash';
import config from 'config';

const options = _.merge(
  {logging: false},
  {
    define: {
      charset: config.has('postgres.charset') ? config.get('postgres.charset') : 'utf8mb4',
      collate: config.has('postgres.collate') ? config.get('postgres.collate') : 'utf8mb4_unicode_ci',
    },
  },
  config.get('postgres'),
  {
    dialect: 'postgres',
  },
  config.has('sequelize.pool')
    ? {
        pool: config.get('sequelize.pool'),
      }
    : {},
  {
    migrationStorage:
      config.has('postgres.migrationStorage') && config.get('postgres.migrationStorage') === 'none'
        ? config.get('postgres.migrationStorage')
        : 'sequelize',
    migrationStorageTableName: config.has('postgres.migrationStorageTableName')
      ? config.get('postgres.migrationStorageTableName')
      : 'SequelizeMeta',
    seederStorage:
      config.has('postgres.seederStorage') && config.get('postgres.seederStorage') === 'none'
        ? config.get('postgres.seederStorage')
        : 'sequelize',
    seederStorageTableName: config.has('postgres.seederStorageTableName')
      ? config.get('postgres.seederStorageTableName')
      : 'SequelizeData',
  },
  config.has('sequelize.defaultOptions') ? config.get('sequelize.defaultOptions') : {}
);

const sequelize = new Sequelize(
  config.get('postgres.database'),
  config.get('postgres.username'),
  config.get('postgres.password'),
  options
);

// var __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const modelPath = path.join(__dirname, "../", "models");

/* Add some sequelize hooks */
sequelize.addHook('beforeValidate', instance => {
  if (_.isObject(instance.dataValues)) {
    Object.keys(instance.dataValues).map(key => {
      const value = instance.dataValues[key];
      instance.dataValues[key] = _.isString(value)
        ? _.trim(
          value
            .replace(/(\r|\n)+/g, '\\n')
            .replace(/\s+/g, ' ')
            .replace(/(\\n)+/g, '\n')
        )
        : value;
      instance.dataValues[key] =
        _.isString(instance.dataValues[key]) && instance.dataValues[key] === '' ? null : instance.dataValues[key];

      return instance.dataValues[key];
    });
  }
});

// // Read all model files
// export const models = async () => {
//   const models = {};
//   const filteredFile = fs.readdirSync(modelPath)
//   .filter(file => {
//     return (file.indexOf('.') !== 0 && file.slice(-3) === '.js')
//   })

//   await Promise.all(filteredFile.map(async file =>{
//     try{
//       const model = await import(pathToFileURL(path.resolve(modelPath, file)))
//       const mod = model.default(sequelize, DataTypes)
//       if (mod.Model) {
//         models[mod.Model.name] = mod;
//       }
//     }catch(err){
//       console.log("errors in reading models", err);
//     }
//   }))
  
//   const modelList = sequelize.models;
//   Object.keys(modelList).forEach(modelName => {
//     if (modelList[modelName].associate) {
//       try {
//         modelList[modelName].associate(modelList);
//       } catch (ex) {
//         console.log("association error", ex);;
//       }
//     }
//   });
//   return models
// }

// Read all model files
export const models = {};
const modelPath = path.resolve(__dirname, '../', 'models');
fs.readdirSync(modelPath)
  .filter(file => file.indexOf('.') !== 0 && file.slice(-3) === '.js')
  .forEach(file => {
    // eslint-disable-next-line global-require
    const modelFile = require(path.join(modelPath, file));
    try {
      const model = modelFile.default(sequelize, DataTypes);
      if (model.Model) {
        models[model.Model.name] = model;
      }
    } catch (ex) {
      logger.error(ex);
    }
  });

// Establish associations
const modelList = sequelize.models;
Object.keys(modelList).forEach(modelName => {
  if (modelList[modelName].associate) {
    try {
      modelList[modelName].associate(modelList);
    } catch (ex) {
      logger.error(ex);
    }
  }
});

export const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.graphQLCache = {};
export default db;