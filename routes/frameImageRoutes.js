const express = require("express");
const router = express.Router();
const frameImage = require("../controllers/frameImageController");

router.post("/add", frameImage.createFrameImage);
router.get("/getAll", frameImage.getAllFrameImages);
router.get("/getFrameImageById/:id", frameImage.getFrameImageById);
router.delete("/delete/:id", frameImage.deleteFrameImage);

module.exports = router;