const Speaker = require('../models/speaker.js')
const { upload, destroy } = require('../libs/fileHandler.js')

const get_speakers = async (req, res) => {
    const { type, version } = req.params
    try {
        const data = await Speaker.find({ type, version })

        return res.status(200).json({
            status: 200,
            message: `Succes Get [${version}].0 Speaker`,
            speaker: data
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

const add_speaker = async (req, res) => {
    const { full_name, organization, version, type } = req.body
    try {
        const payload = {
            full_name,
            organization,
            version,
            type
        }

        if (req.files) {
            // Upload New Image
            const { file } = req.files
            const { url_picture, url_public } = await upload(file)

            payload['picture'] = {
                public_id: url_public,
                url: url_picture
            }
        }

        const data = await Speaker.create(payload)

        if (!data) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Add New Speaker'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Add New Speaker",
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

const update_speaker = async (req, res) => {
    const { full_name, organization, version, type } = req.body
    const { id } = req.params
    try {
        const payload = {
            full_name,
            organization,
            version,
            type
        }

        if (req.files) {
            // Upload New Image
            const { file } = req.files
            const { url_picture, url_public } = await upload(file)

            payload['picture'] = {
                public_id: url_public,
                url: url_picture
            }

            // Delete Exisisting Image
            const existing = await Speaker.findOne({ _id: id }, { picture: 1 })
            destroy(existing.picture.public_id)
        }

        const data = await Speaker.updateOne({ _id: id }, payload)

        if (!data.modifiedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Update Speaker'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Update Speaker",
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

const delete_speaker = async (req, res) => {
    const { id } = req.params
    try {
        // Delete Existing Image
        const existing = await Speaker.findOne({ _id: id }, { picture: 1 })
        destroy(existing.picture.public_id)

        const data = await Speaker.deleteOne({ _id: id })

        if (!data.deletedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Delete Speaker'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Delete Speaker",
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

// const name = async (req,res) => {
//     try{
//         return res.status(200).json({
//             status: 200,
//             message: "STATUS"
//         })
//     }catch(err){
//         return res.status(500).json({
//             status: 500,
//             message: 'failed',
//             info: 'server error'
//         })
//     }
// }

module.exports = { get_speakers, add_speaker, update_speaker, delete_speaker }