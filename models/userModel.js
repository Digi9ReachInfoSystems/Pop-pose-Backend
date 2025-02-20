const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_Name: {
    type: String,
    required: true,
  },
  phone_Number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  payment_Completed: {
    type: Boolean,
    default: false,
  },
  payment_Details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
  },
  consent_Provided: {
    type: Boolean,
    default: false,
  },
  qr_Code: {
    type: String,
  },
  questionnaire_answered: {
    type: Boolean,
  },
  feedback_Given: {
    type: String,
  },
  frame_Selection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "frame",
  },
  photo_selection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "photo",
  },
  no_of_copies: {
    type: Number,
  },
  image_captured: [
    {
      type: String,
    },
  ],
  created_At: {
    type: Date,
  },
});

module.exports = mongoose.model("user", userSchema);
