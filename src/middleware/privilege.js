const { verify_access_token } = require('../libs/jwt')

const communication_role = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];
        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            } else if (decoded.role.toLowerCase() !== 'communication' && decoded.role.toLowerCase() !== 'sysadmin') {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'access denied'
                });
            }
            req.token = decoded
            next()
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        });
    }
}

const event_role = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];
        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            } else if (decoded.role.toLowerCase() !== 'event' && decoded.role.toLowerCase() !== 'sysadmin') {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'access denied'
                });
            }
            req.token = decoded
            next()
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        });
    }
}

const partnership_role = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];
        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            } else if (decoded.role.toLowerCase() !== 'partnership' && decoded.role.toLowerCase() !== 'sysadmin') {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'access denied'
                });
            }
            req.token = decoded
            next()
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        });
    }
}

const sysadmin = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];
        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            } else if (decoded.role.toLowerCase() !== 'sysadmin') {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'access denied'
                });
            }
            req.token = decoded
            next()
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        });
    }
}

const guest = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];
        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            } else if (decoded.role.toLowerCase() !== 'guest') {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'access denied'
                });
            }
            req.token = decoded
            next()
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        });
    }
}

const islogin = (req, res, next) => {
    let access_token = req.headers.authorization
    if (!access_token) {
        return res.status(401).json({
            status: 401,
            message: 'failed',
            info: 'no detected token'
        });
    }

    try {
        access_token = access_token.split(' ')[1];

        verify_access_token(access_token, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: 401,
                    message: 'failed',
                    info: 'expired token'
                });
            }

            req.token = decoded
            next()
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error'
        })
    }
}

module.exports = { sysadmin, communication_role, partnership_role, event_role, guest, islogin }