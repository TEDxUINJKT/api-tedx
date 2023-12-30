const mongoose = require('mongoose')

const event_scheme = new mongoose.Schema({
    event: String,
    description: String,
    date: Date,
    time: String,
    place: String,
    version: String,
    type: {
        type: String,
        enum: ['pre', 'main'],
        default: 'pre'
    },
    thumbnail: {
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

const Event = mongoose.model("Event", event_scheme)

module.exports = Event
