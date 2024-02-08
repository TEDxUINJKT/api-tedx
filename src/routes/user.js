const user = require("express").Router()
const { sysadmin, islogin } = require("../middleware/privilege.js")
const controller = require("../controllers/user.js")

// GET
user.get('/refresh', islogin, controller.refresh)
user.get('/users', sysadmin, controller.user_list)

// POST
user.post('/login', controller.login)
user.post('/guest/register', controller.register_guest)
user.post('/register', sysadmin, controller.register)

// PATCH
user.patch('/update/:id', sysadmin, controller.edit_user)

// DELETE
user.delete('/delete/:id', sysadmin, controller.delete_user)

module.exports = user
