import _ from 'lodash';
import config from 'config';

export const options = _.merge(
  {},
  {
    define: {
      charset: config.has('mysql.charset') ? config.get('mysql.charset') : 'utf8mb4',
      collate: config.has('mysql.collate') ? config.get('mysql.collate') : 'utf8mb4_unicode_ci',
    },
  },
  config.get('mysql'),
  { dialect: 'mysql' },
  config.has('sequelize.pool')
    ? {
        pool: config.get('sequelize.pool'),
      }
    : {},
  {
    migrationStorage:
      config.has('mysql.migrationStorage') && config.get('mysql.migrationStorage') === 'none'
        ? config.get('mysql.migrationStorage')
        : 'sequelize',
    migrationStorageTableName: config.has('mysql.migrationStorageTableName')
      ? config.get('mysql.migrationStorageTableName')
      : 'SequelizeMeta',
    seederStorage:
      config.has('mysql.seederStorage') && config.get('mysql.seederStorage') === 'none'
        ? config.get('mysql.seederStorage')
        : 'sequelize',
    seederStorageTableName: config.has('mysql.seederStorageTableName')
      ? config.get('mysql.seederStorageTableName')
      : 'SequelizeData',
  }
);