const Device = require("../models/backgroundModel");
const { bucket } = require("../config/firebaseConfig"); // Import Firebase storage bucket
const { v4: uuidv4 } = require("uuid");
const { uploadFileToFirebase } = require("../utilities/firebaseutility");

const axios = require("axios");
async function registerDevice(req, res) {
    const { device_key, device_name, address } = req.body;

    if (!device_key || !device_name || !address) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {

        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPEN_CAGE_API_KEY}&q=${encodeURIComponent(address)}&pretty=1&no_annotations=1`);
       
       
        if (!response.data.results || response.data.results.length === 0) {
            return res.status(400).json({ message: "Address could not be geocoded" });
          }
          const latitude = response.data.results[0].geometry.lat;
          const longitude = response.data.results[0].geometry.lng;
          const { country, city, state } = response.data.results[0].components;
       
        const device = new Device({
            device_key,
            device_name,
            device_location: {
                
                Country : country || '',
                City : city || '',
                state : state || '',
            },
            latitude,
            longitude
        });

        console.log("Device Information",device);

        await device.save();
        console.log(device);

        return res.status(201).json({
            message: "Device registered successfully",
            device,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getDevices(req, res) {
    try {
        const devices = await Device.find();

        if (devices.length === 0) {
            return res.status(404).json({ message: "No devices found" });
        }

        return res.status(200).json(devices);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function updateBackgroundImage(req, res) {
    const { device_key } = req.body;
    const file = req.file;

    if (!device_key || !file) {
        return res.status(400).json({ message: "Device key and background image are required" });
    }
    console.log("file ", file);

    try {
        const device = await Device.findOne({ device_key });

        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        const fileUrl= await uploadFileToFirebase(file);
        device.background_image = fileUrl;
        await device.save();
        res.status(200).json({ message: "Background image updated successfully", device });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteDevice(req, res) {
    const { device_key } = req.params;
    try {
        const device = await Device.findOneAndDelete({ device_key });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.status(200).json({ message: "Device deleted successfully", device });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getDeviceById(req, res) {
    const { device_key } = req.params;
    try {
        const device = await Device.findOne({ device_key });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.status(200).json(device);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    registerDevice,
    getDevices,
    updateBackgroundImage,
    deleteDevice,
    getDeviceById
};
