const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
// Admin route to generate coupon code
router.post("/generate-coupon", couponController.generateCoupon);
router.post('/validate', couponController.validateCoupon);
router.get('/getAllCoupons', couponController.getAllCoupons);
router.delete('/deleteCoupon/:id', couponController.deleteCopuponsById);
router.get('/getframeandnumberofcopiesdetails/:id', couponController.getframeandnumberofcopiesdetails);
module.exports = router;
