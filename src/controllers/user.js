const User = require('../models/user.js')
const { encrpyt_one_way, pairing_one_way } = require('../libs/crypt')
const { create_access_token, create_refresh_token, verify_refresh_token } = require('../libs/jwt')

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        //check email is exist
        const user = await User.findOne({ username })

        //when data user is not found
        if (!user) {
            return res.status(400).json({
                status: 400,
                message: 'failed',
                info: 'username not exist, make sure to register your username first'
            })
        } else {
            //compare the password
            const hashPassword = await pairing_one_way(password.toString(), user.password)

            if (hashPassword) {
                //generate access token and refresh token
                const access_token = create_access_token(user._id, user.role);
                const refresh_token = create_refresh_token(user._id, user.role)

                //send cookie with contain refresh token 
                res.cookie("refreshToken", refresh_token, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // one day
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                })

                return res.status(200).json({
                    status: 200,
                    message: 'success',
                    id: user._id,
                    username: user.username,
                    display_name: user.display_name,
                    profile_picture: user.profile_picture,
                    role: user.role,
                    access_token
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    message: 'failed',
                    info: "password doesn't match, please insert a correct password"
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies
        //when user not sent cookie refresh token
        if (!refreshToken) {
            return res.status(400).json({
                status: 400,
                message: 'failed',
                info: 'forbidden'
            })
        } else {
            verify_refresh_token(refreshToken, (error, decoded) => {
                if (error) {
                    console.log(error)
                    return res.status(401).json({
                        status: 401,
                        message: 'failed',
                        info: 'forbidden'
                    })
                } else {
                    // generate token
                    const access_token = create_access_token(decoded.id, decoded.role)
                    const refresh_token = create_refresh_token(decoded.id, decoded.role)

                    //send cookie with contain refresh token
                    res.cookie("refreshToken", refresh_token, {
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //one day
                        httpOnly: true,
                        secure: true,
                        sameSite: "none"
                    })

                    return res.status(200).json({
                        status: 200,
                        message: 'success',
                        role: decoded.role,
                        access_token
                    })
                }
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const register = async (req, res) => {
    const { password, display_name, username, role } = req.body

    try {
        //check duplicated username
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                status: 400,
                message: 'failed',
                info: 'username was used, try use another username'
            });
        } else {
            const encrypted_password = await encrpyt_one_way(password)

            // create user
            const new_user = await User.create({
                username,
                display_name,
                role,
                password: encrypted_password
            })

            if (new_user) {
                //generate access token and refresh token
                const access_token = create_access_token(new_user._id, role);
                const refresh_token = create_refresh_token(new_user._id, role)

                //send cookie with contain refresh token
                res.cookie("refreshToken", refresh_token, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), //one day
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                })

                return res.status(201).json({
                    status: 201,
                    message: 'success',
                    id: new_user._id,
                    username: new_user.username,
                    display_name: new_user.display_name,
                    profile_picture: new_user.profile_picture,
                    role,
                    access_token,
                })

            } else {
                return res.status(400).json({
                    status: 400,
                    message: 'failed',
                    info: 'failed to create an account'
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const edit_user = async (req, res) => {
    const { id } = req.params
    const { role = null, username = null, display_name = null, password = null } = req.body

    try {
        let new_password = ''
        if (password) {
            new_password = await encrpyt_one_way(password)
        }

        const user = await User.updateOne({ _id: id }, { role, username, display_name, password: new_password })

        // when data user is not found
        if (!user.modifiedCount) {
            return res.status(400).json({
                status: 400,
                message: 'failed',
                info: 'user not found'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: 'success',
                info: `successfully update user role ${id}`
            });
        }
    } catch (err) {
        return res.status(404).json({
            status: 404,
            message: 'failed',
            info: 'failed to update user',
            stack: err
        })
    }
}

const delete_user = async (req, res) => {
    const { id } = req.params
    try {
        const deleted_user = await User.deleteOne({ _id: id })
        //when no one user is deleted
        if (deleted_user.deletedCount === 0) {
            return res.status(400).json({
                status: 400,
                message: 'failed',
                info: 'user not found'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: 'success',
                data: `successfully takedown user ${id}`
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const user_list = async (req, res) => {
    try {
        const users = await User.find({}, { _id: 1, username: 1, display_name: 1, role: 1 })

        if (users.length > 0 && users !== null) {
            return res.status(200).json({
                status: 200,
                data: users
            })
        } else {
            return res.status(200).json({
                status: 200,
                data: [],
                message: 'No User Found',
            })
        }

    } catch (error) {
        return res.status(404).json({
            status: 404,
            message: 'failed',
            info: 'Server Error',
            stack: err
        })
    }
}

module.exports = { login, refresh, register, edit_user, delete_user, user_list }