const order = require("express").Router()
const { guest, event_role } = require("../middleware/privilege.js")
const controller = require("../controllers/order.js")

// GET
order.get('/list/:ticket_id', event_role, controller.get_order_list)
order.get('/check/:order_id', event_role, controller.check_order)
order.get('/user/:user_id', guest, controller.get_user_order_list)
order.get('/e-ticket/:order_id', guest, controller.get_eticket)


// POST
order.post('/:ticket_id', controller.add_order)
order.post('/db/:ticket_id', event_role, controller.add_order_without_payment)
order.post('/wb/midtrans', controller.handle_order)

// PATCH
order.patch('/db/:order_id', event_role, controller.update_order)

// DELETE
order.delete('/db/:order_id', event_role, controller.delete_order)

module.exports = order
