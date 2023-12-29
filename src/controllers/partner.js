const Partner = require('../models/partner.js')
const { upload, destroy } = require('../libs/fileHandler.js')

const get_partners = async (req, res) => {
    const { type, version } = req.params
    try {
        const data = await Partner.find({ type, version })

        return res.status(200).json({
            status: 200,
            message: `Succes Get [${type}.0] Partner`,
            partners: data
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

const add_partner = async (req, res) => {
    const { organization, version, type } = req.body
    try {
        const payload = {
            organization,
            version,
            type
        }

        if (req.files) {
            // Upload New Image
            const { file } = req.files
            const { url_picture, url_public } = await upload(file)

            payload['logo'] = {
                public_id: url_public,
                url: url_picture
            }
        }

        const data = await Partner.create(payload)

        if (!data) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Add New Partner'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Add New Partner",
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

const update_partner = async (req, res) => {
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

            payload['logo'] = {
                public_id: url_public,
                url: url_picture
            }

            // Delete Exisisting Image
            const existing = await Partner.findOne({ _id: id }, { logo: 1 })
            destroy(existing.logo.public_id)
        }

        const data = await Partner.updateOne({ _id: id }, payload)

        if (!data.modifiedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Update Partner'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Update Partner",
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

const delete_partner = async (req, res) => {
    const { id } = req.params
    try {
        // Delete Existing Image
        const existing = await Partner.findOne({ _id: id }, { logo: 1 })
        destroy(existing.logo.public_id)

        const data = await Partner.deleteOne({ _id: id })

        if (!data.deletedCount) {
            return res.status(403).json({
                status: 403,
                message: 'failed',
                info: 'Cannot Delete Partner'
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Success Delete Partner",
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

module.exports = { get_partners, add_partner, update_partner, delete_partner }