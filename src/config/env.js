require('dotenv').config()

const config = {
    "PORT": process.env.PORT,
    "MONGO_URL": process.env.MONGO_URL,
    "MAX_AGE_ACCESS_TOKEN": process.env.MAX_AGE_ACCESS_TOKEN,
    "MAX_AGE_REFRESH_TOKEN": process.env.MAX_AGE_REFRESH_TOKEN,
    "REFRESH_TOKEN": process.env.REFRESH_TOKEN,
    "ACCESS_TOKEN": process.env.ACCESS_TOKEN,
    "CDN_CLOUD_NAME": process.env.CDN_CLOUD_NAME,
    "CDN_API_KEY": process.env.CDN_API_KEY,
    "CDN_API_SECRET": process.env.CDN_API_SECRET,
    "MIDTRANS_APP_URL_DEV": process.env.MIDTRANS_APP_URL_DEV,
    "MIDTRANS_API_URL_DEV": process.env.MIDTRANS_API_URL_DEV,
    "MIDTRANS_APP_URL_PROD": process.env.MIDTRANS_APP_URL_PROD,
    "MIDTRANS_API_URL_PROD": process.env.MIDTRANS_API_URL_PROD,
    "MIDTRANS_MERCHANT_ID": process.env.MIDTRANS_MERCHANT_ID,
    "MIDTRANS_CLIENT_KEY": process.env.MIDTRANS_CLIENT_KEY,
    "MIDTRANS_SERVER_KEY": process.env.MIDTRANS_SERVER_KEY,
    "FRONT_END_URL_DEV": process.env.FRONT_END_URL_DEV,
    "FRONT_END_URL_PROD": process.env.FRONT_END_URL_PROD,
    "NODEMAILER_HOST": process.env.NODEMAILER_HOST,
    "NODEMAILER_PORT": process.env.NODEMAILER_PORT,
    "NODEMAILER_USER": process.env.NODEMAILER_USER,
    "NODEMAILER_PASS": process.env.NODEMAILER_PASS
}

module.exports = config