const routes = require('express').Router()

// Default
routes.get('/', (req, res) => {
    res.json({
        message: 'Welcome to TEDxUINJakarta Rest API',
        createdBy: "TEDxUINJKT DEV TEAM"
    })
})

// ---------------NEW ROUTES HERE------------------

// ------------------------------------------------

routes.get('*', (req, res) => {
    res.json({
        status: 404,
        message: 'Endpoint not found',
    })
})

module.exports = routes