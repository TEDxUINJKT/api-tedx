const mongoose = require('mongoose')

const content_scheme = new mongoose.Schema({
    version: String,
    data: {
        type: Object,
        default: {}
    },
    type: {
        type: String,
        enum: ['banner', 'timeline', 'teaser', 'theme'],
        default: 'banner'
    }
})

const Content = mongoose.model("Content", content_scheme)

module.exports = Content
