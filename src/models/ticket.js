const mongoose = require('mongoose')

const ticket_scheme = new mongoose.Schema({
    event_id: String,
    type_ticket: String,
    description: String,
    price: Number,
    order_link: {
        type: String,
        default: 'https://google.com'
    },
    status: {
        type: String,
        enum: ['Available', 'Sold Out'],
        default: 'Available'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

const Ticket = mongoose.model("Ticket", ticket_scheme)

module.exports = Ticket