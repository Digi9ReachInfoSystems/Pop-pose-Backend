const express = require("express");
const router = express.Router();
const multer = require("multer");

const user = require("../controllers/userController");
// Use memory storage instead of disk storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // Limit file size to 5MB
  },
});
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
