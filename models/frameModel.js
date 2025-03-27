const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  frame_size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  shapes: {
    type: String,
    default: "circle",
  },
  rows: {
    type: Number,
    required: true,
  },
  columns: {
    type: Number,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  orientation: {
    type: String,
    required: true,
  },
  no_of_photos: {
    type: Number,
  },
  background: [
    {
      type: String,
    },
  ],
  padding: {
    type: Number,
    default: 10, // Default padding between images in pixels
  },
  horizontal_gap: {
    type: Number,
    default: 10, // Default horizontal gap between images in pixels
  },
  vertical_gap: {
    type: Number,
    default: 10, // Default vertical gap between images in pixels
  },
});

module.exports = mongoose.model("frame", frameSchema);
