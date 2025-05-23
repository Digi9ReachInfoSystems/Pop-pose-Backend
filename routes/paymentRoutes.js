const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentContoller');

router.post("/create-payment", paymentController.createPayment);
router.get("/get-all-payments", paymentController.getAllPayments);
router.post("/payment-captured", paymentController.verifyPayment);
router.get("/get-payment-by-userId/:userId", paymentController.getPaymentByUserId);
router.post("/getPayment/Status", paymentController.getPaymentStatus);
module.exports = router;
