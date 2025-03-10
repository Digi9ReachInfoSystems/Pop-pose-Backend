const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
    consent_title: {
        type: String,
        required: true,
    },
    consent_description: {
        type: String,
        required: true,
    },

});

module.exports = mongoose.model("consent", consentSchema);