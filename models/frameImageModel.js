const mongoose = require("mongoose");

const frameImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image:{
        type: String,
    }
});

module.exports = mongoose.model("frameImage", frameImageSchema);