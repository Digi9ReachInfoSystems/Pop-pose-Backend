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
const { bucket } = require("./../config/firebaseConfig"); // Import the initialized Firebase bucket
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Create a unique filename for the image
    const fileName = `images/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Upload the file to Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // Get the public URL of the uploaded file
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "01-01-2030", // Expiration date for the URL
    });

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to upload image" });
  }
});
router.get("/getAllUsers", user.getAllUsers);
router.post("/provideConsent/:userId", user.provideConsent);
router.post("/send-to-email", upload.single("image"), user.sendFrameToEmail);
router.get("/getImagesByUserId/:userId", user.getImagesByUserId);
router.get("/getDetailsByUserId/:userId", user.getDetailsByUserId);
router.delete(
  "/deleteImagesByUserId/:userId",
  user.deleteImagesCapturedByUserId
);

router.get("/getTotalCount", user.totalUseras);
router.get("/getTotalFrames", user.totalFrames);
router.get("/getTotalCopies", user.totalNoOfCopies);
router.post("/uplaodImageUsingUserId/:userId",upload.single("finalImage") ,user.uplaodImageUsingUserId);
module.exports = router;
