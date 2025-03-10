const express = require("express");
const router = express.Router();
const consent = require("../controllers/consentController");

router.post("/createConsent", consent.createConsent);
router.get("/getConsent", consent.getConsent);
router.put("/update", consent.updateConsent);

module.exports = router;