const mongoose = require('mongoose')

const speaker_scheme = new mongoose.Schema({
    full_name: String,
    organization: String,
    version: String,
    type: {
        type: String,
        enum: ['Student Speaker', 'Main Speaker'],
        default: 'Student Speaker'
    },
    picture: {
        public_id: {
            type: String,
            default: "none"
        },
        url: {
            type: String,
            default: "none"
        },
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

const Speaker = mongoose.model("Speaker", speaker_scheme)

module.exports = Speaker