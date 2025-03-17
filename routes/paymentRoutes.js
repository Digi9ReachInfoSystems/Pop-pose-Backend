const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentContoller");

router.post("/create-payment", paymentController.createOrder);
module.exports = router;