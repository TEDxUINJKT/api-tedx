const routes = require('express').Router()

const user = require('./user')
const event = require('./event')
const speaker = require('./speaker')
const partner = require('./partner')
const content = require('./content')

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
routes.use('/speaker', speaker)
routes.use('/partner', partner)
routes.use('/content', content)

// ------------------------------------------------

routes.get('*', (req, res) => {
    res.json({
        status: 404,
        message: 'Endpoint not found',
    })
})

module.exports = routes