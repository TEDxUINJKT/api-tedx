const partner = require("express").Router()
const { partnership_role } = require("../middleware/privilege.js")
const controller = require("../controllers/partner.js")

// GET
partner.get('/:version/:type', controller.get_partners)

// POST
partner.post('/', partnership_role, controller.add_partner)

// PATCH
partner.patch('/:id', partnership_role, controller.update_partner)

// DELETE
partner.delete('/:id', partnership_role, controller.delete_partner)

module.exports = partner
