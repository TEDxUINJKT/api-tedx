const nodemailer = require("nodemailer");
const config = require('./env')

const {
    NODEMAILER_HOST,
    NODEMAILER_PORT,
    NODEMAILER_USER,
    NODEMAILER_PASS
} = config

const transporter = nodemailer.createTransport({
    host: NODEMAILER_HOST,
    port: NODEMAILER_PORT,
    auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS
    }
});

const send_email = async (config) => {
    try {
        const res = await transporter.sendMail(config)  
        return res
} catch (err) {
        console.log(err)
    }
}

module.exports = send_email