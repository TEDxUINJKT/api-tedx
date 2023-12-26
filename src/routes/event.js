const event = require("express").Router()
const { event_role } = require("../middleware/privilege.js")
const controller = require("../controllers/event.js")

// GET
event.get('/:version', controller.get_event)
event.get('/detail/:id', controller.get_detail_event)
event.get('/ticket/:id', controller.get_ticket_list)

// POST
event.post('/', event_role, controller.add_event)
event.post('/ticket/:id', event_role, controller.add_ticket)

// PATCH
event.patch('/:id', event_role, controller.update_event)
event.patch('/ticket/:id', event_role, controller.update_ticket)

// DELETE
event.delete('/:id', event_role, controller.delete_event)
event.delete('/ticket/:id', event_role, controller.delete_ticket)

module.exports = event
