const mongoose = require("mongoose");

const backgroundSchema = new mongoose.Schema({
    device_key: {
        type: String,
        required: true,
        unique: true,
    },
    device_name: {
        type: String,
        required: true,
    },
    background_image: {
        type: String,
        required: true,
        default: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg", // Replace with your default image URL
    },
   

    device_location: {
       Country: {
            type: String,
            required: true,
        },
        City: {
            type: String,
            required: true,
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
