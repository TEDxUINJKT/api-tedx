const content = require("express").Router()
const { communication_role } = require("../middleware/privilege.js")
const controller = require("../controllers/content.js")

// GET
content.get('/:version/:type', controller.get_content)

// POST
content.post('/', communication_role, controller.add_content)

// PATCH
content.patch('/:id', communication_role, controller.update_content)

// DELETE
content.delete('/:id', communication_role, controller.delete_content)

module.exports = content
