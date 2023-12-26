const mongoose = require('mongoose')

const user_scheme = new mongoose.Schema({
    username: String,
    display_name: String,
    password: String,
    role: {
        type: String,
        enum: ['Sysadmin', 'Communication', 'Event', 'Partnership', 'Guest'],
        default: 'Guest'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

const User = mongoose.model("User", user_scheme)

module.exports = User