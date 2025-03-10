const mongoose = require('mongoose');

const backdropSchema = new mongoose.Schema({
    frameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Frame',
        required: true,
    },
    backdropImage: {
        type: String,
        required: true,
    },
    orientation: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Backdrop', backdropSchema);