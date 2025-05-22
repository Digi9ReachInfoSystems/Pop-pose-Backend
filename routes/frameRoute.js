const express = require("express");
const router = express.Router();
const frameController = require("../controllers/frameController");
router.post("/frameupdated", frameController.createFrameUpdated);

router.post("/frames", frameController.createFrame); // Create a frame
router.get("/frames", frameController.getFrames); // Get all frames
router.get("/getFramesById/:id", frameController.getFrameDetailsById); // Get frames by ID
router.get("/frames/:id", frameController.getFrameById); // Get a specific frame by ID
router.put("/frames/:id", frameController.updateFrame); // Update a frame by ID

router.delete("/frames/:id", frameController.deleteFrame); // Delete a frame by ID
router.get("/getImagesByFrmaeId/:id", frameController.getImagesByFrameId);
router.get(
  "/getBackgroundByFrameId/:id",
  frameController.getBackgroundByFrameId
);

module.exports = router;
