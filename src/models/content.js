const mongoose = require('mongoose')

const content_scheme = new mongoose.Schema({
    version: String,
    data: {
        type: Object,
        default: {}
    },
    type: {
        type: String,
        enum: ['Banner', 'Timeline', 'Teaser', 'Theme'],
        default: 'Banner'
    }
})

const Content = mongoose.model("Content", content_scheme)

module.exports = Content