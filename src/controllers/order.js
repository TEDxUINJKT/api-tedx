const Order = require('../models/order.js')
const crypto = require('crypto')

const config = require('../config/env.js')
const send_email = require('../config/nodemailer')
const midtransClient = require('midtrans-client');

const {
    MIDTRANS_SERVER_KEY
} = config

const snapMidtrans = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY
});

const get_order_list = async (req, res) => {
    const { ticket_id } = req.params
    try {
        const orders = await Order.find({ ticket_id })

        return res.status(200).json({
            status: 200,
            message: 'Success Get Order List',
            data: orders
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const check_order = async (req, res) => {
    const { order_id } = req.params
    try {
        console.log(order_id)
        const order = await Order.findOne({ _id: order_id })
        console.log(order)
        if (order) {
            return res.status(200).json({
                status: 200,
                message: 'Success Get Order Data',
                data: order
            })
        } else {
            return res.status(400).json({
                status: 400,
                message: 'Order Data Not Found',
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const get_user_order_list = async (req, res) => {
    const { user_id } = req.params
    try {
        const orders = await Order.find({ user_id })

        return res.status(200).json({
            status: 200,
            message: 'Success Get User Order List',
            data: orders
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const add_order = async (req, res) => {
    const { user_id, price, event_name, total_price, email, first_name, last_name, university, phone_number, is_refferal, refferal } = req.body
    const { ticket_id } = req.params
    try {
        const payload = {
            ticket_id, user_id, price, total_price, email, full_name: `${first_name} ${last_name}`, university, phone_number, is_refferal, refferal
        }

        const data = await Order.create(payload)

        const midtrans_payload = {
            transaction_details: {
                order_id: data._id.toString(),
                gross_amount: total_price
            },
            item_details: [
                {
                    id: ticket_id,
                    name: event_name.slice(0, 20),
                    price: total_price,
                    quantity: 1,
                    user: user_id
                }
            ],
            customer_details: {
                email,
                first_name,
                last_name,
                phone: phone_number
            },
            additional: {
                is_refferal,
                refferal_code: refferal
            }
        }
        snapMidtrans.createTransaction(midtrans_payload).then(async (midtrans_response) => {
            await Order.updateOne({ _id: data._id },
                {
                    snap_token: midtrans_response.token,
                    snap_redirect_url: midtrans_response.redirect_url
                })

            return res.status(200).json({
                status: 200,
                message: "Success Add New Order",
                data,
                snap_token: midtrans_response.token,
                snap_redirect_url: midtrans_response.redirect_url
            })

        }).catch(err => {
            return res.status(500).json({
                status: 500,
                message: 'Midtrans Failed',
                info: 'Cannot Add New Order {MIDTRANS}',
                stack: err
            })
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const update_order = async (req, res) => {
    const { price, total_price, email, full_name, university, phone_number, payment_method, is_refferal, refferal, status } = req.body
    const { order_id } = req.params

    try {
        const payload = {
            price, total_price, email, full_name, university, phone_number, payment_method, is_refferal, refferal, status
        }

        const data = await Order.updateOne({ _id: order_id }, payload)

        if (!data) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Add Update Order'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Add Update Order",
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const delete_order = async (req, res) => {
    const { order_id } = req.params
    try {
        const data = await Partner.deleteOne({ _id: order_id })

        if (!data.deletedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Delete Order'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Delete Order",
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const updateStatusBaseOnMidtrans = async (order_id, data) => {
    const hash = crypto.createHash('sha512').update(`${order_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')

    if (data.signature_key !== hash) {
        return {
            status: 'error',
            message: 'Invalid Signature Key'
        }
    }

    let responseData = null
    const payment_status = data.transaction_status
    const fraud_status = data.fraud_status

    const config = {
        from: {
            name: 'TEDxUINJakarta',
            address: 'tedxuinjktdev@gmail.com'
        }, // sender address
        to: ["azzamizzudinhasan@gmail.com"], // list of receivers
        subject: "E-Ticket Event Main Event TEDxUINJakarta", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>INI TEST</b>", // html body
    }

    if (payment_status == 'capture') {
        if (fraud_status == 'accept') {
            await send_email(config)
            responseData = await Order.updateOne({ _id: order_id }, { status: 'Paid', payment_method: data.payment_type })
        }
    } else if (payment_status == 'settlement') {
        await send_email(config)
        responseData = await Order.updateOne({ _id: order_id }, { status: 'Paid', payment_method: data.payment_type })
    } else if (payment_status == 'cancel' ||
        payment_status == 'deny' ||
        payment_status == 'expire') {
        responseData = await Order.updateOne({ _id: order_id }, { status: 'Failed' })
    } else if (payment_status == 'pending') {
        responseData = await Order.updateOne({ _id: order_id }, { status: 'Pending' })
    }

    return {
        status: 'success',
        data: responseData
    }
}

const handle_order = async (req, res) => {
    const body = req.body
    try {
        const data = await Order.findOne({ _id: body.order_id })

        if (data) {
            updateStatusBaseOnMidtrans(body.order_id, body).then(result => console.log(result))
        }

        res.status(200).json({
            status: 'success',
            message: 'OK'
        })


    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

// const name = async (req,res) => {
//     try{
//         return res.status(200).json({
//             status: 200,
//             message: "STATUS"
//         })
//     }catch(err){
//         return res.status(500).json({
//             status: 500,
//             message: 'failed',
//             info: 'server error',
//             stack: err
//         })
//     }
// }

module.exports = { get_order_list, check_order, get_user_order_list, add_order, update_order, delete_order, handle_order }