import requestIp from 'request-ip';
import moment from 'moment';
import config from 'config';
import shortUUID from 'short-uuid';
import { Op } from 'sequelize';

import AbstractModel from '../lib/abstract/model';
import { jwtSignAsync } from '../lib/utils/jwt-async';

export default (sequelize, DataTypes) => {
  const schema = {
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'session:data-error-required',
        },
      },
    },
    device: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'session:data-error-required',
        },
      },
    },
    expires: {
      type: DataTypes.DATE,
    },
    ip: {
      type: DataTypes.STRING,
    },
    lastRequestDate: {
      type: DataTypes.STRING,
    },
    lastUsedIp: {
      type: DataTypes.STRING,
    },
  };

  const options = {
    indexes: [],
  };

  class SessionModel extends AbstractModel {
    constructor() {
      super();

      // Define the model
      this.defineModel(sequelize, 'Session', schema, options);

      // Define the model associations
      this.defineAssociations(({ User }) => {
        this.Model.user = this.Model.belongsTo(User.getModel(), {
          foreignKey: {
            name: 'user',
            allowNull: false,
            validate: {
              notNull: true,
            },
          },
          onDelete: 'CASCADE',
        });
      });
    }

    /**
     * Destroy by session sid.
     * @param {Object} sessionId
     */
    async destroyBySessionId(sessionId) {
      return this.Model.destroy({ where: { sessionId } });
    }

    /**
     * Destroy by user.
     * @param {Object} user
     */
    async destroyByUser(user) {
      await this.Model.destroy({ where: { user } });
    }

    /**
     * Save user session.
     * @param {Object} req
     * @param {Object} userData
     * @param {Boolean} rememberDevice
     */
    async save(req, userData, rememberDevice = false) {
      const device = this.getDevice(req);
      const ip = requestIp.getClientIp(req);
      const sessionId = shortUUID.uuid();
      const exp = Math.floor(Date.now() / 1000) + config.get('sessions.expires.refreshTokenLifeTimeWithoutRemember');
      const tokenData = { ...userData, sessionId };
      if (!rememberDevice) {
        tokenData.exp = exp;
      }

      const refreshToken = await jwtSignAsync(tokenData, config.get('security.jwtSecret'), {
        algorithm: config.get('security.jwtAlgorithm'),
      });

      await this.create({
        sessionId,
        user: userData.id,
        refreshToken,
        device,
        expires: rememberDevice ? null : moment.utc(exp * 1000).format(),
        ip,
        lastUsedIp: ip,
        lastRequestDate: moment.utc().format(),
      });

      return {
        refreshToken,
        sessionId,
      };
    }

    getDevice(req) {
      return req.cookies.aaclient || req.headers['aa-client'] || req.headers['user-agent'];
    }

    /**
     * Restore user session.
     * @param {String} sessionId
     * @param {Object} req
     * @param {Object} userData
     */
    async restore(sessionId, req, userData) {
      const session = await this.findOne({
        where: { sessionId },
      });

      // Extract device Info from request.
      const device = this.getDevice(req);

      if (!session) {
        throw error('refresh-token:unknown-refresh-token-error', 'UNKNOWN_TOKEN');
      }

      // Update device on refreshToken.
      session.device = device;

      if (session.expires === null) {
        await session.save();
        return { newRefreshToken: session.refreshToken, rememberDevice: true };
      }
      const exp = Math.floor(Date.now() / 1000) + config.get('sessions.expires.refreshTokenLifeTimeWithoutRemember');
      const refreshToken = await jwtSignAsync({ ...userData, sessionId, exp }, config.get('security.jwtSecret'), {
        algorithm: config.get('security.jwtAlgorithm'),
      });

      session.refreshToken = refreshToken;
      session.expires = moment.utc(exp * 1000).format();
      await session.save();

      return { newRefreshToken: refreshToken, rememberDevice: false };
    }

    /**
     * Find session and update lastRequestDate and lastUsedIp
     * @param {Object} req
     * @param {String} sessionId
     */
    async updateLastParams(req, sessionId) {
      const session = await this.findOne({
        where: { sessionId },
      });
      if (session) {
        session.lastRequestDate = moment.utc().format();
        session.lastUsedIp = requestIp.getClientIp(req);

        await session.save();
      }
    }

    /**
     * Destroy expired sessions
     */
    async destroyExpiredSessions() {
      await this.Model.destroy({ where: { expires: { [Op.lte]: moment.utc().format() } } });
    }
  }

  return new SessionModel();
};
