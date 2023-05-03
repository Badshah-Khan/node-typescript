import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ReS, ReE } from "../Services/service.js";
import { models } from '../lib/db.js';


export const createUser = async (req, res) => {
    const { User, Session } = models
    var requestData = req.body;
    var createObj = {};
    var sessionObj = {};

    if (requestData.name) {
        createObj['name'] = requestData.name;
    } else {
        return ReE(res, 'Enter name', 422);
    }

    if (requestData.email) {
        createObj['email'] = requestData.email;
    } else {
        return ReE(res, 'Enter email', 422);
    }

    if (requestData.password) {
        createObj['password'] = await bcrypt.hash(requestData.password, 6);
    } else {
        return ReE(res, 'Enter password', 422);
    }

    var create;
    create = await User.create(createObj);
    if (create) {
        const token = jwt.sign(createObj, 'jwtSecretKey');
        const expirydate = 5 * 60 * 1000;
        sessionObj['user'] = create.id;
        sessionObj['token'] = token;
        sessionObj['expiry_date'] = new Date(expirydate + Date.now());

        var sessionData = await Session.create(sessionObj);
        if (sessionData) {
            return ReS(res, sessionData.token, 200);
        } else {
            return ReE(res, 'session not created', 422);
        }
    } else {
        return ReE(res, 'User not Created', 422);
    };
}
