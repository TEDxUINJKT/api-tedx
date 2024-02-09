const Order = require('../models/order.js')
const Ticket = require('../models/ticket.js')
const Event = require('../models/event.js')
const crypto = require('crypto')

const config = require('../config/env.js')
const send_email = require('../config/nodemailer')
const midtransClient = require('midtrans-client');

const {
    FRONT_END_URL_PROD,
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

const updateStatusBaseOnMidtrans = async (order_id, body, data) => {
    const hash = crypto.createHash('sha512').update(`${order_id}${body.status_code}${body.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')

    if (body.signature_key !== hash) {
        return {
            status: 'error',
            message: 'Invalid Signature Key'
        }
    }
    const ticket = await Ticket.findOne({ _id: data.ticket_id })
    const event = await Event.findOne({ _id: ticket.event_id })

    let responseData = null
    const payment_status = body.transaction_status
    const fraud_status = body.fraud_status

    const config = {
        from: {
            name: 'TEDxUINJakarta',
            address: 'tedxuinjktdev@gmail.com'
        }, // sender address
        to: [data.email], // list of receivers
        subject: "E-Ticket TEDxUINJakarta", // Subject line
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-Ticket</title>
            <style>
                body {
                    font-family: Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #fff;
                    color: #fff;
                    padding: 10px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .content {
                    padding: 20px;
                }
                .ticket {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .ticket h2 {
                    color: #eb0028;
                    margin-top: 0;
                }
                .ticket p {
                    margin-top: 5px;
                }
                .cta{
                display:flex;
                align-items:center;
                justify-content:center
                }
            .cta button{
                background-color: #eb0028;
                border:none;
                padding: 14px 32px;
                color:white;
                font-size:1.1em;
                border-radius:50px;
            }
                .footer {
                    background-color: #eb0028;
                    color: #fff;
                    padding: 10px;
                    text-align: center;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://res.cloudinary.com/dnbtkwgwz/image/upload/v1707485076/idvp4ypfne3kc3809cew.png"/>
                </div>
                <div class="content">
                    <div class="ticket">
                        <p>Thank you for being part of TEDx UIN Jakarta 2.0. Your ticket purchase has been successful, below are the details of the ticket.</p>
                        <p><strong>Order ID:</strong> ${order_id}</p>
                        <p><strong>Guest:</strong> ${data.full_name}</p>
                        <p><strong>Event:</strong> ${event.event}</p>
                        <p><strong>Date:</strong> ${event.date}</p>
                        <p><strong>Location:</strong> ${event.place}</p>
                        <p><strong>Price:</strong> ${body.gross_amount}</p>
                        
                    </div>
                <div class="cta">
                <a href="${FRONT_END_URL_PROD}/e-ticket/${order_id}" target="_blank">
                    <button>Check E-Ticket</button>
                </a>
                </div>
                <br/>
                    <p>Thank you for booking your ticket with us. If you have any questions or concerns, feel free to contact us.</p>
                </div>
                <div class="footer">
                <p>This independent TEDx event is operated under license from TED.</p>
                    <p>&copy; 2024 All rights reserved</p>
                </div>
            </div>
        </body>
        </html>`, // html body
    }

    if (payment_status == 'capture') {
        if (fraud_status == 'accept') {
            await send_email(config)
            responseData = await Order.updateOne({ _id: order_id }, { status: 'Paid', payment_method: body.payment_type })
        }
    } else if (payment_status == 'settlement') {
        await send_email(config)
        responseData = await Order.updateOne({ _id: order_id }, { status: 'Paid', payment_method: body.payment_type })
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
            updateStatusBaseOnMidtrans(body.order_id, body, data).then(result => console.log(result))
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