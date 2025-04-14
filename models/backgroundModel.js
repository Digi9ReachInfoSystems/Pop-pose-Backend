const mongoose = require("mongoose");

const backgroundSchema = new mongoose.Schema({
    device_key: {
        type: String,
        required: true,
        // unique: false
    },
    device_name: {
        type: String,
        required: true,
    },
    base_url: {
        type:String,
    },
    printer_name:{
        type:String,
    },
    background_image: {
        type: String,
        required: true,
        default: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg",
    },
    device_location: {
        Country: {
            type: String,
            required: true,
        },
        City: {
            type: String,
            required: true,
            default:"banaglore",
        },
        state: {
            type: String,
            required: true,
        },


    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Device", backgroundSchema);
