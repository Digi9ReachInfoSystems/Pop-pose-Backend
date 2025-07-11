const mongoose = require("mongoose");
const frameSchema = new mongoose.Schema({
  frame_size: { type: String, required: true },
  price: { type: Number, required: true },
  shapes: { type: String, default: "circle" },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  index: { type: Number, required: true },
  image: { type: String }, // Main frame image
  orientation: { type: String, required: true },
  no_of_photos: { type: Number },

  // Overlay configuration
  overlay: { type: Boolean, default: false },
  overlayImage: { type: String }, // URL/path to overlay image
  overlayRegions: [
    {
      x: Number, // px from left
      y: Number, // px from top
      width: Number,
      height: Number,
      zIndex: { type: Number, default: 3 }, // Highest z-index
    },
  ],

  // Placeholders configuration
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
      zIndex: { type: Number, default: 1 }, // Below overlay
    },
  ],

  // Other properties
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
