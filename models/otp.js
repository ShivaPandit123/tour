const mongoose = require("mongoose");
const otp = new mongoose.Schema({
  type: { type: String, required: true, enum: ["verify", "pswd"] },
  email: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  resend: {
    count: {
      type: Number,
    },
    on: {
      type: Date,
    },
  },
  validity: {
    type: Date,
  },
  attempt: {
    type: Number,
  },
});
const Otp = new mongoose.model("otp", otp);
module.exports = Otp;
