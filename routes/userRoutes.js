const express = require("express");
const router = express.Router();
const multer = require("multer");

const user = require("../controllers/userController");
const upload = multer({ dest: "uploads/" }); 

router.get("/:userId/getUser", user.getUserForPayment);
router.post("/start", user.startUserJourney);
router.post("/:userId/select-frame", user.selectFrame);
router.post("/:userId/select-number", user.createNoOfCopies);
router.post("/save-images", user.saveImages);
router.get("/getAllUsers", user.getAllUsers);
router.post("/provideConsent/:userId", user.provideConsent);
router.post("/send-to-email", upload.single("image"), user.sendFrameToEmail);
router.get("/getImagesByUserId/:userId", user.getImagesByUserId);
router.get("/getDetailsByUserId/:userId", user.getDetailsByUserId);
router.delete(
  "/deleteImagesByUserId/:userId",
  user.deleteImagesCapturedByUserId
);
module.exports = router;
