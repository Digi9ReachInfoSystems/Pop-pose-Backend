const express = require("express");
const router = express.Router();
const { registerDevice, getDevices, getRemainingCopies,updateBackgroundImage, deleteDevice,getDeviceById,updateUrl } = require("../controllers/backgroundController");
const multer = require("multer");
const path = require("path")

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/register", registerDevice);
router.get("/devices", getDevices);
router.put("/update-background-image",upload.single("background_image"), updateBackgroundImage);
router.delete("/deleteDevice/:device_key", deleteDevice);
router.get("/getDeviceById/:device_key", getDeviceById); //get device by id
router.put("/updateUrl/:device_key", updateUrl);
router.get("/getRemainingCopies/:id", getRemainingCopies);
module.exports = router;
