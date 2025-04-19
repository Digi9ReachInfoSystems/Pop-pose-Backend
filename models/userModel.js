const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_Name: {
    type: String,
    // required: true,
  },
  frame_image: {
    type: String,
  },
  phone_Number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(\+91)?[6-9]{1}[0-9]{9}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! It must start with +91 and have 10 digits.`,
    },
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },



  device_key: {
    type: String,
    // required: true,
    // unique: false
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "noOfCopies",
  },

  image_captured: [
    {
      type: String,
    },
  ],
  qr_code_id: {
    type: String,
  },
  customer_id: {
    type: String,
  },
  created_At: {
    type: Date,
  },
});

module.exports = mongoose.model("user", userSchema);
