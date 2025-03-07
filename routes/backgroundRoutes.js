const express = require("express");
const router = express.Router();
const { registerDevice, getDevices, updateBackgroundImage, deleteDevice } = require("../controllers/backgroundController");
const multer = require("multer");
const path = require("path")

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/register", registerDevice);
router.get("/devices", getDevices);
router.put("/update-background-image",upload.single("background_image"), updateBackgroundImage);
router.delete("/deleteDevice/:device_key", deleteDevice);
module.exports = router;
