require('dotenv').config()

const config = {
    "PORT": process.env.PORT,
    "MONGO_URL": process.env.MONGO_URL,
    "MAX_AGE_ACCESS_TOKEN": process.env.MAX_AGE_ACCESS_TOKEN,
    "MAX_AGE_REFRESH_TOKEN": process.env.MAX_AGE_REFRESH_TOKEN,
    "REFRESH_TOKEN": process.env.REFRESH_TOKEN,
    "ACCESS_TOKEN": process.env.ACCESS_TOKEN,
    "REDIRECT_URI": process.env.REDIRECT_URI,
    "CLIENT_ID": process.env.CLIENT_ID,
    "CLIENT_SECRET": process.env.CLIENT_SECRET,
}

module.exports = config