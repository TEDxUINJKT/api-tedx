const mongoose = require('mongoose')

const order_scheme = new mongoose.Schema({
    ticket_id: String,
    user_id: String,
    guest_data:{
        type:Array,
        default:[
            {
                price:0,
                email:'',
                full_name:'',
                first_name:'',
                last_name:'',
                university:'',
                phone_number:''
            }
        ]
    },
    total_price: Number,
    ticket_type:String,
    event_name: String,
    quantity:{
        type:Number,
        default:1
    },
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
        enum: ['Unpaid', 'Paid', 'Failed', 'Pending', 'Special'],
        default: 'Unpaid'
    },
    is_attend: {
        type: Boolean,
        default: false
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