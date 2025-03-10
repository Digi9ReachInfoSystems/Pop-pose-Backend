const express = require("express");
const router = express.Router();
const backdrop = require("../controllers/backdropController");

router.post("/createBackdrop/:frameId", backdrop.createBackdrop);
router.get("/getAllBackdrops", backdrop.getAllBackgrops);
router.put("/updateBackdrop/:backdropId", backdrop.updateBackdropById);
router.delete("/deleteBackdrop/:backdropId", backdrop.deleteBackdropById);  

module.exports = router;
