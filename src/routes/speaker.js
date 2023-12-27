const speaker = require("express").Router()
const { event_role } = require("../middleware/privilege.js")
const controller = require("../controllers/speaker.js")

// GET
speaker.get('/:version/:type', controller.get_speakers)

// POST
speaker.post('/', event_role, controller.add_speaker)

// PATCH
speaker.patch('/:id', event_role, controller.update_speaker)

// DELETE
speaker.delete('/:id', event_role, controller.delete_speaker)

module.exports = speaker
