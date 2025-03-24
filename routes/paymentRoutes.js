const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentContoller");

router.post("/create-payment", paymentController.createOrder);
router.get("/get-all-payments", paymentController.getAllPayments);
router.post("/payment-captured", paymentController.verifyPayment);
module.exports = router;