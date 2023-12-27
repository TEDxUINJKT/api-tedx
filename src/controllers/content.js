const Content = require('../models/content.js')
const { upload, destroy } = require('../libs/fileHandler.js')

const get_content = async (req, res) => {
    const { type, version } = req.params
    try {
        const data = await Content.findOne({ type, version })

        return res.status(200).json({
            status: 200,
            message: `Succes Get [${type}] Content`,
            content: data
        })
    } catch (err) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            info: 'server error',
            stack: err
        })
    }
}

const add_content = async (req, res) => {
    const { data, version, type } = req.body
    try {
        const payload = {
            version,
            data,
            type
        }

        if (req.files) {
            // Upload New Image
            const { file } = req.files
            const { url_picture, url_public } = await upload(file)

            payload.data['image'] = {
                public_id: url_public,
                url: url_picture
            }
        }

        const existing = await Content.findOne({ version, type })

        if (existing) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Data Already Added (Update-Only)'
            })
        } else {
            const content = await Content.create(payload)

            if (!content) {
                return res.status(403).json({
                    status: 403,
                    message: 'failed',
                    info: 'Cannot Add New Content'
                })
            } else {
                return res.status(200).json({
                    status: 200,
                    message: "Success Add New Content",
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

const update_content = async (req, res) => {
    const { data, version, type } = req.body
    const { id } = req.params
    try {
        const payload = {
            data,
            version,
            type
        }

        if (req.files) {
            // Upload New Image
            const { file } = req.files
            const { url_picture, url_public } = await upload(file)

            payload.data['image'] = {
                public_id: url_public,
                url: url_picture
            }

            // Delete Exisisting Image
            const existing = await Content.findOne({ _id: id }, { data: 1 })
            destroy(existing.data.image.public_id)
        }

        const content = await Content.updateOne({ _id: id }, payload)

        if (!content.modifiedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Update Content'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Update Content",
            })
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

const delete_content = async (req, res) => {
    const { id } = req.params
    try {
        // Delete Existing Image
        const existing = await Content.findOne({ _id: id }, { data: 1 })
        destroy(existing.data.image.public_id)

        const data = await Content.deleteOne({ _id: id })

        if (!data.deletedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Delete Content'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Delete Content",
            })
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

module.exports = { get_content, add_content, update_content, delete_content }