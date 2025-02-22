const express = require("express");
const router = express.Router();
const frameController = require("../controllers/frameController");

router.post("/frames", frameController.createFrame); // Create a frame
router.get("/frames", frameController.getFrames); // Get all frames
router.get("/frames/:id", frameController.getFrameById); // Get a specific frame by ID
router.put("/frames/:id", frameController.updateFrame); // Update a frame by ID
router.delete("/frames/:id", frameController.deleteFrame); // Delete a frame by ID

module.exports = router;
