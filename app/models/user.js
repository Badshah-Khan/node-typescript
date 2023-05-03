import Promise from 'bluebird';
import bcrypt from 'bcrypt';
import config from 'config';

import AbstractModel from '../lib/abstract/model';

function cryptPassword(password) {
  return Promise.fromCallback(cb =>
    bcrypt.genSalt(config.has('security.saltRounds') ? config.get('security.saltRounds') : 10, null, cb)
  ).then(salt => Promise.fromCallback(cb => bcrypt.hash(password, salt, cb)));
}

export default (sequelize, DataTypes) => {
  const schema = {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'user:first-name-error-required',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'user:last-name-error-required',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'email',
        msg: 'user:email-error-unique',
      },
      validate: {
        notNull: {
          msg: 'user:email-error-required',
        },
        isEmail: {
          msg: 'user:email-error-invalid',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'user:password-error-required',
        },
        len: {
          args: [config.get('app.password.passwordMinLength')],
          msg: 'user:password-error-length',
        },
        is: {
          args: [new RegExp(config.get('app.password.policy'))],
          msg: 'user:password-error-policy',
        },
      },
      exclude: {
        output: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  };

  const options = {
    indexes: [],
    hooks: {
      afterValidate: async d => {
        if (d.password) {
          d.password = await cryptPassword(d.password);
        }
      },
    },
  };

  class UserModel extends AbstractModel {
    constructor() {
      super();

      // Define the model
      this.defineModel(sequelize, 'User', schema, options);

    }
  }

  return new UserModel();
};
