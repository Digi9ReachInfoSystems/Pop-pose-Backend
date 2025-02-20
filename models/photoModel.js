const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  image_url: [
    {
      type: String,
      required: true,
    },
  ],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("photo", photoSchema);
