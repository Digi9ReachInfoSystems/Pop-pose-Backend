const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentContoller');

// Route to create Razorpay Customer
router.post('/create-customer', paymentController.createCustomer);

// // Route to generate Razorpay QR Code
router.post('/generate-qr', paymentController.generateQRCode);

// // Route to verify payment status
router.post('/verify-payment/:qrCodeId', paymentController.checkPaymentStatus);

module.exports = router;
