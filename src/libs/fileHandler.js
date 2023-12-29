const fs = require('fs')
const path = require("path");

const cloudinary = require('../config/cloudinary.js')

async function upload(file) {
    // const tempFilePath = path.join(`temp_${file.name}`) // Local
    const tempFilePath = path.join('/tmp', file.name) // Vercel
    fs.writeFileSync(tempFilePath, file.data)

    const { secure_url: url_picture, public_id: url_public } = await cloudinary.uploader.upload(tempFilePath)

    fs.unlinkSync(tempFilePath)

    return { url_picture, url_public }
}

async function destroy(public_id) {
    await cloudinary.uploader.destroy(public_id)
}

module.exports = { upload, destroy }
