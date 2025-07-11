const express = require("express");
const router = express.Router();
const frameImage = require("../controllers/frameImageController");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

router.post("/add", frameImage.createFrameImage);
router.get("/getAll", frameImage.getAllFrameImages);
router.get("/getFrameImageById/:id", frameImage.getFrameImageById);
router.delete("/delete/:id", frameImage.deleteFrameImage);
router.post("/signature", (req, res) => {
  const { meetingNumber, role = 0 } = req.body; // 0 = attendee, 1 = host
  if (!meetingNumber) return res.status(400).json({ error: "meetingNumber?" });

  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60; // good for 1 h

  const payload = {
    sdkKey: process.env.ZOOM_CLIENT_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  const signature = jwt.sign(payload, process.env.ZOOM_CLIENT_SECRET, {
    algorithm: "HS256",
    header: { typ: "JWT" },
  });

  res.json({ signature, sdkKey: process.env.ZOOM_CLIENT_KEY });
});

module.exports = router;
