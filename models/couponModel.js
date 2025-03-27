const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  frameSelection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "frame",
    required: true,
  },
  noOfCopies: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "noOfCopies",
    required: true,
  },
  totalInstances: {
    type: Number,
    required: true,
  },
  instancesClaimed: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
