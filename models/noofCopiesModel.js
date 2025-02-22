const mongoose = require("mongoose");

const noOfCopies = new mongoose.Schema({
  Number: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("noOfCopies", noOfCopies);
