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
    default: null
  },
  noOfCopies: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "noOfCopies",
    default: null
  },
  totalInstances: {
    type: Number,
    required: true,
  },
  instancesClaimed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Coupon", couponSchema);