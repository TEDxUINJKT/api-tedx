const mongoose = require('mongoose')

const partner_scheme = new mongoose.Schema({
    organization: String,
    version: String,
    type: {
        type: String,
        enum: ['Sponsor', 'Medpart'],
        default: 'Sponsor'
    },
    logo: {
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

const Partner = mongoose.model("Partner", partner_scheme)

module.exports = Partner