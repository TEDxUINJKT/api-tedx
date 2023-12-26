const { v2: cloudinary } = require('cloudinary')
const config = require('./env')

const {
    CLOUD_NAME,
    API_KEY,
    API_SECRET } = config

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

module.exports = cloudinary