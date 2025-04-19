const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
   feedback:{
    type: String,
    required: true,
   },
   rating:{
    type: Number,
    required: true,
    max: 5
   },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("rating", ratingSchema);