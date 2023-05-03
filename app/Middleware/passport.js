import {JwtStrategy,ExtractJwt} from 'passport-jwt';
// import passport from 'passport';
import {users} from '../Model/index.js';


 export default (passport) => {
    passport.use(
        new JwtStrategy(
            {
                secretOrKey: 'jwtSecretKey',
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            },
            async function (jwt_payload, cb) {
                const user = await users.findOne({ where: { email: jwt_payload.email } });
                if (user) {
                    return cb(null, user);
                }
                else {
                    return cb(null, false);
                }
            }
        )
    )
}
