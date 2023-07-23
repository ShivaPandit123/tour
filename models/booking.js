const mongoose = require("mongoose");
const booking = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdon: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "inquiry"],
  },
  billing: {
    price: {
      type: Number,
    },
    advance: {
      recived: {
        type: Boolean,
      },
      amount: {
        type: Number,
      },
    },
    cashpaid: {
      type: Number,
    },
    balance: {
      amount: {
        type: Number,
      },
    },
  },
  tour: {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  gst: {
    type: String,
  },
  note: {
    type: String,
  },
  addon: {
    type: String,
  },
  member: {
    type: Number,
    required: true,
  },
  traveller: {
    type: String,
    required: true,
  },
  expdate: {
    type: String,
    required: true,
  },
});
const Booking = new mongoose.model("booking", booking);
module.exports = Booking;
