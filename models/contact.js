const mongoose = require("mongoose");
const contact = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ["lts", "cnt"] },
  name: {
    type: String,
  },
  phone: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  issue: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "solved"],
  },
});
const Contact = new mongoose.model("contact", contact);
module.exports = Contact;
