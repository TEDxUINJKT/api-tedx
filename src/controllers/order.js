const Order = require('../models/order.js')
const Ticket = require('../models/ticket.js')
const Event = require('../models/event.js')
const crypto = require('crypto')
const { verify_access_token } = require('../libs/jwt.js')

const config = require('../config/env.js')
const send_email = require('../config/nodemailer')
const playwright = require('playwright-core')
const chromium = require('@sparticuz/chromium')
const midtransClient = require('midtrans-client')
const { jsPDF } = require("jspdf")
const axios = require('axios')

const {
    FRONT_END_URL_PROD,
    MIDTRANS_SERVER_KEY
} = config

const snapMidtrans = new midtransClient.Snap({
    isProduction: true,
    serverKey: MIDTRANS_SERVER_KEY
});

const get_order_list = async (req, res) => {
    const { event_id } = req.params
    try {
        const orders = await Order.find({ event_id }).sort({created_at:-1})
        console.log(orders)
    
        if (orders.length > 0) {            
            return res.status(200).json({
                status: 200,
                message: 'Success Get Order List',
                data: orders
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: 'Data Not Found',
                data: []
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

const check_order = async (req, res) => {
    const { order_id } = req.params
    try {
        const order = await Order.findOne({ _id: order_id })
        if (order) {
            if (!order.attend_status) {
                const payload = { attend_status: true }

                const data = await Order.updateOne({ _id: order_id }, payload)
                return res.status(200).json({
                    status: 200,
                    message: "Guest is Attended",
                    data
                })
            } else {
                return res.status(401).json({
                    status: 401,
                    info: "Ticket is already used",
                })
            }
        }else{
            return res.status(400).json({
                status: 400,
                info: 'Order Data Not Found',
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

const get_eticket = async (req, res) => {
    const { order_id } = req.params
    const { authorization: raw_token } = req.headers

    const token = raw_token.split(' ')[1]

    try {
        verify_access_token(token, async (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'forbidden'
                })
            } else {
                const order = await Order.findOne({ _id: order_id })

                if (decoded.id === order.user_id) {
                    const ticket = await Ticket.findOne({ _id: order.ticket_id })
                    const event = await Event.findOne({ _id: ticket.event_id })

                    return res.status(200).json({
                        status: 200,
                        message: "success get eticket data",
                        data: { order, ticket, event }
                    })
                } else {
                    return res.status(401).json({
                        status: 401,
                        message: 'failed',
                        info: 'forbidden e-ticket access'
                    })
                }
            }
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

const get_pub_eticket = async (req, res) => {
    const { order_id } = req.params

    try {
        const order = await Order.findOne({ _id: order_id })

        const ticket = await Ticket.findOne({ _id: order.ticket_id })
        const event = await Event.findOne({ _id: ticket.event_id })

        return res.status(200).json({
            status: 200,
            message: "success get eticket data",
            data: { order, ticket, event }
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

const add_order_without_payment = async (req, res) => {
    const { user_id, event_name, event_id,ticket_type, email, first_name, last_name, university, phone_number } = req.body
    const { ticket_id } = req.params
    try {
        const quantity = 1
        const payload = {
            ticket_id, quantity, event_name, event_id, ticket_type, user_id, price: 0, total_price: 0, email, full_name: `${first_name} ${last_name}`, university, phone_number, status: 'Paid'
        }

        const {quota} = await Ticket.findOne({_id:ticket_id}, {quota:1})

        if(quota >= quantity){
            const data = await Order.create(payload)

            if (data) {
                if(quota-quantity === 0){
                    await Ticket.updateOne({ _id: ticket_id},
                        {
                            status: 'Sold Out',
                            quota: quota-quantity
                        })
                }else{
                    await Ticket.updateOne({ _id: ticket_id},
                        {
                            quota: quota-quantity
                        })
                }

                getPDF(data._id, payload)
                
                return res.status(200).json({
                    status: 200,
                    message: "Success Add New Order",
                    data
                })
            } else {
                return res.status(500).json({
                    status: 500,
                    info: 'Cannot Add New Order',
                })
            }
        }else{
            return res.status(500).json({
                status: 500,
                info: 'Out of Quota',
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const add_order = async (req, res) => {
    const { user_id, price, event_name,event_id,quantity,ticket_type, total_price, email, first_name, last_name, university, phone_number, is_refferal, refferal } = req.body
    const { ticket_id } = req.params
    try {
        const payload = {
            ticket_id, user_id,event_name,event_id, price, total_price,quantity,ticket_type, email, full_name: `${first_name} ${last_name}`, university, phone_number, is_refferal, refferal
        }

        const {quota} = await Ticket.findOne({_id:ticket_id}, {quota:1})

        if(quota >= quantity){
            const data = await Order.create(payload)

            const midtrans_payload = {
                transaction_details: {
                    order_id: data._id.toString(),
                    gross_amount: total_price
                },
                item_details: [
                    {
                        id: ticket_id,
                        name: `${ticket_name} Ticket`,
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

                if(quota-quantity === 0){
                    await Ticket.updateOne({ _id: ticket_id},
                        {
                            status: 'Sold Out',
                            quota: quota-quantity
                        })
                }else{
                    await Ticket.updateOne({ _id: ticket_id},
                        {
                            quota: quota-quantity
                        })
                }
                
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
        }else{
            if(quantity === 0){
                await Ticket.updateOne({ _id: ticket_id},
                    {
                        status: 'Sold Out'
                    })
            }
            
            return res.status(500).json({
                status: 400,
                message: 'Order Failed',
                info: 'Out Of Quota',
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

const update_order = async (req, res) => {
    const { email, full_name, university, phone_number,status } = req.body
    const { order_id } = req.params

    try {   
        const payload = {
            email, full_name, university, phone_number, status
        }

        console.log(order_id)

        const data = await Order.updateOne({ _id: order_id }, payload)

        if (data.modifiedCount === 0) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Update Order'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Update Order",
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

const getPDF = async (order_id, data) => {
    const config = {
        from: {
            name: 'TEDxUINJakarta',
            address: 'tedxuinjktdev@gmail.com'
        }, // sender address
        to: [data.email], // list of receivers
        subject: "E-Ticket TEDxUINJakarta", // Subject line
        html: `<!DOCTYPE html>
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
                    padding: 20px 10px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                .header,.footer {
                    background-color: #fff;
                    color: #fff;
                    padding: 10px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
        
                .header img{
                    width: 100%;
                    height: auto;
                }
                .footer img{
                    width: 40%;
                    height: auto;
                }
        
                .ticket {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
        
                .ticket h2 {
                    color: #eb0028;
                    margin-top: 0;
                }
        
                p a {
                    color: #eb0028;
                }
        
                .ticket p {
                    margin-top: 5px;
                    text-align: justify;
                    line-height: 1.5em;
                }
        
                .cta {
                    width: 100%;
                    margin: 50px 0;
                }
        
                .cta a {
                    width: fit-content;
                    margin: auto;
                    display: block;
                }
        
                .cta button {
                    background-color: #eb0028;
                    border: none;
                    padding: 14px 52px;
                    color: white;
                    font-size: 1em;
                    border-radius: 20px;
                }
            </style>
        </head>
        
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://res.cloudinary.com/dnbtkwgwz/image/upload/v1708162393/rqoavfbiwaiktstjdjfh.png">
                </div>
                <div class="content">
                    <div class="ticket">
                        <p>Halo ${data.full_name},</p>
                        <p><b>Payment Success: Ticket Confirmed! 🎫</b></p>
                        <p>Yeayy! Ticket payment has been made successfully! Now it's time to grab your tickets and get ready for an unforgettable experience!</p>
                        <p>Click the button below to instantly access your tickets:</p>
                        <div class="cta">
                            <a href="${FRONT_END_URL_PROD}/pub/all/${order_id}" target="_blank">
                                <button>Download Ticket</button>
                            </a>
                        </div>
                        <p>Make sure you prepare with passion and enthusiasm. If you have any questions or need any assistance, please do not hesitate to <a
                            href="https://wa.me/6281210696745" target="_blank">contact
                            us</a>.</p>
                        <p>Thank you, we hope you enjoy every moment of this event ✨✨
                            Hope to see you there!</p>
                        <br>
                        <br>
                        <p><b>TEDxUINJakarta</b></p>
                    </div>            
                </div>
                <div class="footer">
                    <img src="https://res.cloudinary.com/dnbtkwgwz/image/upload/v1707485076/idvp4ypfne3kc3809cew.png" />
                </div>
            </div>
        </body>
        
        </html>`,// html body,
    }

    await send_email(config)
    await Order.updateOne({ _id: order_id }, { sended_email: true })

    return "Send Email"
}

const checkHash = async (body) => {
    const hash = crypto.createHash('sha512').update(`${body.order_id}${body.status_code}${body.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')

    if (body.signature_key !== hash) {
        return {
            status: 'error',
            message: 'Invalid Signature Key'
        }
    } else {
        return {
            status: 'success',
            message: 'Valid Signature Key'
        }
    }
}

const handle_order = async (req, res) => {
    const body = req.body
    try {
        checkHash(body)

        const data = await Order.findOne({ _id: body.order_id })

        const payment_status = body.transaction_status
        const fraud_status = body.fraud_status

        if (payment_status == 'capture') {
            if (fraud_status == 'accept') {
                await Order.updateOne({ _id: body.order_id }, { status: 'Paid', payment_method: body.payment_type })
                getPDF(body.order_id, data).then(result => console.log(result))
            }
        } else if (payment_status == 'settlement') {
            await Order.updateOne({ _id: body.order_id }, { status: 'Paid', payment_method: body.payment_type })
            getPDF(body.order_id, data).then(result => console.log(result))
        } else if (payment_status == 'cancel' || payment_status == 'deny' || payment_status == 'expire') {
            await Order.updateOne({ _id: body.order_id }, { status: 'Failed', payment_method: body.payment_type })
        } else if (payment_status == 'pending') {
            await Order.updateOne({ _id: body.order_id }, { status: 'Pending', payment_method: body.payment_type })
        }

        res.status(200).json({
            status: 'success',
            message: 'OK',
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

module.exports = { get_order_list, check_order, get_user_order_list, add_order_without_payment, add_order, update_order, delete_order, handle_order, get_eticket,get_pub_eticket}