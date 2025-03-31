const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  qr_code_id: String,
  image_url: String,
  customer_id: String,
  payment_amount: Number,
  description: String,
  payment_success: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Customer', paymentSchema);
