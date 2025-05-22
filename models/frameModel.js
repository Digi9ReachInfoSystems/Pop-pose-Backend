const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  overlay: { type: Boolean, default: false },
  frame_size: { type: String, required: true },
  price: { type: Number, required: true },
  shapes: { type: String, default: "circle" },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  index: { type: Number, required: true },
  image: { type: String },
  orientation: { type: String, required: true }, // Horizontal or Vertical
  no_of_photos: { type: Number },

  // Store all individual placeholder data
  placeholders: [
    {
      id: Number,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      padding: {
        left: Number,
        top: Number,
        right: Number,
        bottom: Number,
      },
    },
  ],
  background: [{ type: String }],
  padding: { type: Number, default: 10 },
  bottomPadding: { type: Number, default: 10 },
  topPadding: { type: Number, default: 10 },
  horizontal_gap: { type: Number, default: 10 },
  vertical_gap: { type: Number, default: 10 },

  is4by6: { type: Boolean },
  is2by6: { type: Boolean },
  one: { type: Boolean },
  two: { type: Boolean },
  three: { type: Boolean },
  four: { type: Boolean },
  five: { type: Boolean },
  six: { type: Boolean },
  seven: { type: Boolean },

  frameImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "frameImage",
  },
});

module.exports = mongoose.model("frame", frameSchema);
