/** @format */

const Event = require("../models/event.js");
const Ticket = require("../models/ticket.js");
const { upload, destroy } = require("../libs/fileHandler.js");
const { encrypt } = require("../libs/crypto.js");

const get_event = async (req, res) => {
  const { version } = req.params;
  try {
    const data = await Event.find({ version }).sort({ created_at: -1 });

    return res.status(200).json({
      status: 200,
      message: "Success Get Event List",
      events: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const get_detail_event = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Event.findOne({ _id: id });

    if (!data) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Find Event",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Get Event Detail",
        detail: data,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const get_ticket_detail = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await Ticket.findOne({ _id: id });

    if (!ticket) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Find Ticket",
      });
    } else {
      const event = await Event.findOne({ _id: ticket.event_id });

      const plain = JSON.stringify(ticket);
      const parsed = JSON.parse(plain);

      return res.status(200).json({
        status: 200,
        message: "Success Get Ticket Detail",
        detail: {
          ticket: {
            ...parsed,
            refferal: encrypt(JSON.stringify(parsed.refferal)),
          },
          event,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const get_ticket_list = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Ticket.find({ event_id: id, is_publish: true }).sort({
      created_at: -1,
    });

    const new_data = data.map((each) => {
      const plain = JSON.stringify(each);
      const parsed = JSON.parse(plain);
      return {
        ...parsed,
        refferal: encrypt(JSON.stringify(each.refferal)),
      };
    });

    return res.status(200).json({
      status: 200,
      message: "Success Get Ticket List",
      tickets: new_data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const get_ticket_all_list = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Ticket.find({ event_id: id }).sort({ created_at: -1 });

    return res.status(200).json({
      status: 200,
      message: "Success Get Ticket List",
      tickets: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const add_event = async (req, res) => {
  const { event, description, date, time, place, version, type } = req.body;
  try {
    let payload = {
      event,
      description,
      date,
      time,
      place,
      version,
      type,
    };

    if (req.files) {
      // Upload New Thumbnail
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["thumbnail"] = {
        public_id: url_public,
        url: url_picture,
      };
    }

    const data = await Event.create(payload);

    if (!data) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Add New Event",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Add New Event",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const add_ticket = async (req, res) => {
  const { id } = req.params;
  const {
    type_ticket,
    bundle_status,
    quota,
    is_publish,
    description,
    price,
    status,
    refferal,
    redirect = "",
  } = req.body;
  try {
    const payload = {
      event_id: id,
      type_ticket,
      description,
      bundle_status,
      quota,
      is_publish,
      price,
      status,
      refferal,
      redirect,
    };

    const data = await Ticket.create(payload);

    if (!data) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Add New Ticket",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Add New Ticket",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const update_event = async (req, res) => {
  const { id } = req.params;
  const { event, description, date, time, place, version, type } = req.body;
  try {
    let payload = {
      event,
      description,
      date,
      time,
      place,
      version,
      type,
    };

    if (req.files) {
      // Upload New Thumbnail
      const { file } = req.files;
      const { url_picture, url_public } = await upload(file);

      payload["thumbnail"] = {
        public_id: url_public,
        url: url_picture,
      };

      // Delete Exisisting Thumbnail
      const existing = await Event.findOne({ _id: id }, { thumbnail: 1 });
      destroy(existing.thumbnail.public_id);
    }

    const data = await Event.updateOne({ _id: id }, payload);

    if (!data.modifiedCount) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Update Event",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Update Event",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const update_ticket = async (req, res) => {
  const { id } = req.params;
  const {
    type_ticket,
    bundle_status,
    quota,
    is_publish,
    description,
    price,
    status,
    refferal,
    redirect = "",
  } = req.body;
  try {
    let payload = {
      type_ticket,
      description,
      bundle_status,
      quota,
      is_publish,
      price,
      status,
      refferal,
      redirect,
    };

    console.log(payload);

    const data = await Ticket.updateOne({ _id: id }, payload);

    if (!data.modifiedCount) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Update Ticket",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Update Ticket",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const delete_event = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete Existing Image
    const existing = await Event.findOne({ _id: id }, { thumbnail: 1 });
    destroy(existing.thumbnail.public_id);

    const event = await Event.deleteOne({ _id: id });

    if (!event.deletedCount) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Delete Event",
      });
    } else {
      await Ticket.deleteMany({ event_id: id });
      return res.status(200).json({
        status: 200,
        message: "Success Delete Event and Ticket",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

const delete_ticket = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Ticket.deleteOne({ _id: id });

    if (!data.deletedCount) {
      return res.status(403).json({
        status: 403,
        message: "failed",
        info: "Cannot Delete Ticket",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Success Delete Ticket",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      info: "server error",
      stack: err,
    });
  }
};

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

module.exports = {
  get_event,
  get_detail_event,
  get_ticket_detail,
  get_ticket_all_list,
  get_ticket_list,
  add_event,
  add_ticket,
  update_event,
  update_ticket,
  delete_event,
  delete_ticket,
};
