/** @format */

const mongoose = require("mongoose");

const ticket_scheme = new mongoose.Schema({
  event_id: String,
  type_ticket: String,
  description: String,
  price: Number,
  quota: Number,
  bundle_status: {
    type: Object,
    default: {
      is_bundle: false,
      bundle_count: 1,
    },
  },
  status: {
    type: String,
    enum: ["Available", "Sold Out"],
    default: "Available",
  },
  is_publish: {
    type: Boolean,
    default: true,
  },
  redirect: {
    type: String,
    default: "",
  },
  refferal: {
    type: Array,
    default: [],
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Ticket = mongoose.model("Ticket", ticket_scheme);

module.exports = Ticket;
