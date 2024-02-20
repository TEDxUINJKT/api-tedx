const order = require("express").Router()
const { guest, event_role } = require("../middleware/privilege.js")
const controller = require("../controllers/order.js")

// GET
order.get('/list/:event_id', controller.get_order_list)
order.get('/user/:user_id', guest, controller.get_user_order_list)
order.get('/e-ticket/:order_id', guest, controller.get_eticket)
order.get('/pub/e-ticket/:order_id', controller.get_pub_eticket)
order.get('/test/:id', controller.sendMail)

// POST
order.post('/:ticket_id', controller.add_order)
order.post('/db/:ticket_id', event_role, controller.add_order_without_payment)
order.post('/wb/midtrans', controller.handle_order)

// PATCH
order.patch('/db/:order_id', event_role, controller.update_order)
order.patch('/check/:order_id', event_role, controller.check_order)


// DELETE
order.delete('/db/:order_id', event_role, controller.delete_order)

module.exports = order
