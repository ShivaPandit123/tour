const mongoose = require("mongoose");
const tour = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    required: true,
    enum: [
      "Mountain tourism",
      "Religious tourism",
      "Cultural tourism",
      "Rural tourism",
    ],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startp: {
    type: String,
  },
  meta: {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    keyword: {
      type: String,
      required: true,
    },
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
    },
  ],
  itinerary: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  addon: [
    {
      product: {
        type: String,
      },
    },
  ],
  inclusion: [
    {
      description: {
        type: String,
      },
    },
  ],
  exclusion: [
    {
      description: {
        type: String,
      },
    },
  ],
  duration: {
    type: Number,
  },
  faq: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
});
const Tour = new mongoose.model("tour", tour);
module.exports = Tour;
