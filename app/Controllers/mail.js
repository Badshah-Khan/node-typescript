import nodemailer from 'nodemailer';
import { ReS,ReE } from '../Services/service.js';

const sendmails = async (req, res) => {

    var { from, to } = req.body;
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: 'rjwebexpert52@gmail.com',
            pass: 'igthswuyczmpzrnt'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOption = {
        from: from,
        to: to,
        subject: 'testing mail',
        message: 'Hello from node api'
    }

    try {
        transporter.sendMail(mailOption, (error, data) => {
            if (error) {
                console.log(error);
                return ReE(res, error, 422);
            } else {
                console.log('Email sent');
                return ReS(res, 'Email sent successfully', 200);
            }
        });
    } catch (error) {
        console.log("err", error);
    }

};

export default sendmails;