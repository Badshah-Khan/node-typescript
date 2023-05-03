import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import http from 'http';
import passport from 'passport';
import cors from "cors"
import route from './app/Routes/router.js';
import db from "./app/lib/db.js";
import _ from "lodash"
// @ts-ignore
import gql from 'graphql-sequelize';
// @ts-ignore
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import graphqlSchema from './app/lib/graphql/index.js';
import config from 'config';
import requestIp from 'request-ip';
import { models } from './app/lib/db.js';
import authPlugin from './app/lib/graphql/authPlugin.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const httpServer = http.createServer(app);

const { resolver } = gql;

const { sequelize } = db;

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());
app.get('/', function (req, res) {
    res.send()
});


sequelize.authenticate().then(() => {
    console.log("db connected successfully");
    sequelize.sync().then(async () => {
        console.log("table created successfully");
            
        // Create Apollo Server
            const apolloServer = new ApolloServer({
                schema: graphqlSchema,
                introspection: config.has('graphql.introspection') ? config.get('graphql.introspection') : true,
                plugins: [
                    ApolloServerPluginDrainHttpServer({ httpServer }),
                    // @ts-ignore
                    authPlugin
                ],
            });
            try{
                await apolloServer.start();
                app.use(
                    "/graphql",
                    cors<cors.CorsRequest>(),
                    bodyParser.json(),
                    expressMiddleware(apolloServer, {
                        context: async ({ req, res }) => {
                            const dataloaderContext = createContext(sequelize);
                            const clientIp = requestIp.getClientIp(req);
                            req.clientIp = clientIp;
                            resolver.contextToOptions = {
                                dataloaderContext,
                            };
                            return {
                                req,
                                res,
                                [EXPECTED_OPTIONS_KEY]: dataloaderContext,
                            };
                        },
                    }),
                );
                app.use("/", route)
                await new Promise<void>((resolve) => httpServer.listen({ port: 3000 }, resolve));
                console.log(`Application Running on http://localhost:3000`);
        } catch(err){
            console.log("graphql start error", err);
        }
        
    }).catch((err: any) => {
        console.log("creating table error", err);
    })
}).catch((err: any) => {
    console.log("err", err);
});


