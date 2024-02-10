const { v2: cloudinary } = require('cloudinary')
const config = require('./env')

const {
    CDN_CLOUD_NAME,
    CDN_API_KEY,
    CDN_API_SECRET } = config

cloudinary.config({
    cloud_name: CDN_CLOUD_NAME,
    api_key: CDN_API_KEY,
    api_secret: CDN_API_SECRET
});

module.exports = cloudinary
