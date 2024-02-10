const mongoose = require('mongoose')

const order_scheme = new mongoose.Schema({
    ticket_id: String,
    user_id: String,
    price: Number,
    total_price: Number,
    email: String,
    full_name: String,
    university: String,
    phone_number: String,
    event_name: String,
    payment_method: {
        type: String,
        default: 'none'
    },
    snap_token: {
        type: String,
        default: 'none'
    },
    snap_redirect_url: {
        type: String,
        default: 'none'
    },
    status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Attended', 'Failed', 'Canceled', 'Pending'],
        default: 'Unpaid'
    },
    is_refferal: {
        type: Boolean,
        default: false
    },
    refferal: {
        type: String,
        default: 'none'
    },
    created_at: {
        type: Date,
        default: new Date()
    }
})

const Order = mongoose.model("Order", order_scheme)

module.exports = Order