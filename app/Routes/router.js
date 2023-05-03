import express from 'express';
import passport from 'passport';
import { createUser } from '../Controllers/create.js';
import maildata from '../Controllers/mail.js';
import fetchData from '../Controllers/fetch.js';
import stripeUser from '../Controllers/stripe.js';

var route = express.Router();

// route.post('/mail/data', maildata.sendmails);

route.post('/create/data', createUser);

route.get('/fetch/data', fetchData);

// route.post('/stripe/amount',stripeUser.stripeData);


export default route;