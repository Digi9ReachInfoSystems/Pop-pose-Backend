const mongoose = require('mongoose');

const pageTimerSchema = new mongoose.Schema({
  pageName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 100   // optional, adjust as you like
  },
  timerSeconds: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('PageTimer', pageTimerSchema);
