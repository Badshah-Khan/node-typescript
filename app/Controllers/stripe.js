// const Stripe = require('stripe');
// const stripe = Stripe('sk_test_51MJBJISAMerZubVnUBavDz1mbZnyhWTg7nqkx4bcTJp7tE0gLVnexsMQpDsmnxd13CPyjMINXcP233eTFRFNkT8I00XjbBdvkz');
// const { ReS, ReE } = require('../Services/service.js');

const stripeData = (req, res) => {
    // var requestData = req.body;
    // stripe.charges.create({
    //     amount: requestData.amount,
    //     currency: "INR",
    //     source: "tok_mastercard", // obtained with Stripe.js
    //     metadata: { 'order_id': '6735' }
    // }, function (err, response) {
    //    if(err){
    //     console.log("err",err);
    //     return ReE(res,err,422);
    //    }else{
    //     return ReS(res,response,200);
    //    }
    // });

};

export default stripeData;