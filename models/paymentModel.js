const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  payment_Completed: {
    type: Boolean,
    default: false,
  },
  payment_Details: {
    type: String,
  },
  payment_method: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  order_id: {
    type: String,
  },
  reciept_id:{
    type:String
  }
});

module.exports = mongoose.model("payment", paymentSchema);
