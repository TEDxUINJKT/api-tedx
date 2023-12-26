const routes = require('express').Router()

const user = require('./user')
const event = require('./event')

// Default
routes.get('/', (req, res) => {
    res.json({
        message: 'Welcome to TEDxUINJakarta Rest API',
        createdBy: "TEDxUINJKT DEV TEAM"
    })
})

// ---------------NEW ROUTES HERE------------------

routes.use('/auth', user)
routes.use('/event', event)

// ------------------------------------------------

routes.get('*', (req, res) => {
    res.json({
        status: 404,
        message: 'Endpoint not found',
    })
})

module.exports = routes