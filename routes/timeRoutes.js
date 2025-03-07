

const express = require("express");
const router = express.Router();
const TimerController = require("../controllers/timerController");

router.post("/getTimer/:value", TimerController.getTimer);
router.put("/updateTimer/:value", TimerController.updateTimer);
router.delete("/deleteTimer/:value", TimerController.deleteTimer);


module.exports = router;