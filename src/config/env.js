require('dotenv').config()

const config = {
    "PORT": process.env.PORT,
    "MONGO_URL": process.env.MONGO_URL,
    "MAX_AGE_ACCESS_TOKEN": process.env.MAX_AGE_ACCESS_TOKEN,
    "MAX_AGE_REFRESH_TOKEN": process.env.MAX_AGE_REFRESH_TOKEN,
    "REFRESH_TOKEN": process.env.REFRESH_TOKEN,
    "ACCESS_TOKEN": process.env.ACCESS_TOKEN,
    "CLOUD_NAME": process.env.CLOUD_NAME,
    "API_KEY": process.env.API_KEY,
    "API_SECRET": process.env.API_SECRET,

}

module.exports = config