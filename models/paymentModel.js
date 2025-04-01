const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  customer_Id: {
    type: String,
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
  },
  qrId: {
    type: String,
  },
  paymentId: {
    type: String,
  },
});

module.exports = mongoose.model('Customer', paymentSchema);
