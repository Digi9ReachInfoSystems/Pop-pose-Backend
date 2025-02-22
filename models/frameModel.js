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
  rows: {
    type: Number,
    required: true,
  },
  column: {
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
});

module.exports = mongoose.model("frame", frameSchema);
