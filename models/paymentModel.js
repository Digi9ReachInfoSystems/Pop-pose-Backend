const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: {
   type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  
  qr_code_id: {
    type:String,
  },
  image_url: String,
  customer_id: String,
  payment_amount: Number,
  description: String,
  payment_completed: {
    type: mongoose.Schema.Types.Boolean,
  }

}, { timestamps: true });

module.exports = mongoose.model('payment', paymentSchema);
