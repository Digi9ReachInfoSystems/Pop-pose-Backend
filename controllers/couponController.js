const mongoose = require("mongoose");
const Frame = require("../models/frameModel"); 
const NoOfCopies = require("../models/noofCopiesModel");  
const Coupon = require("../models/couponModel");  

const generateCouponCode = () => {
  return Math.random().toString(36).substr(2, 9).toUpperCase(); 
};

const generateCoupon = async (req, res) => {
  try {
    const { frameSelectionId, noOfCopiesId, totalInstances } = req.body;

    // Make frameSelectionId and noOfCopiesId optional
    let frameSelection = null;
    let noOfCopies = null;

    if (frameSelectionId) {
      frameSelection = await Frame.findById(frameSelectionId);
      if (!frameSelection) {
        return res.status(404).json({ message: "Invalid frame selection." });
      }
    }

    if (noOfCopiesId) {
      noOfCopies = await NoOfCopies.findById(noOfCopiesId);
      if (!noOfCopies) {
        return res.status(404).json({ message: "Invalid number of copies." });
      }
    }

    const instances = totalInstances || 1;
    const couponCode = generateCouponCode();

    const newCoupon = new Coupon({
      code: couponCode,
      frameSelection: frameSelection?._id || null,
      noOfCopies: noOfCopies?._id || null,
      totalInstances: instances,
      instancesClaimed: 0,
    });

    await newCoupon.save();

    return res.status(201).json({
      message: "Coupon generated successfully.",
      couponCode,
      frameSelection: frameSelection || null,
      noOfCopies: noOfCopies || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ 
        message: "Coupon code is required." 
      });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ code: couponCode })
      .populate('frameSelection')
      .populate('noOfCopies');

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code." });
    }

    // Check if coupon is already fully claimed
    if (coupon.instancesClaimed >= coupon.totalInstances) {
      return res.status(400).json({ message: "This coupon has been fully claimed." });
    }

    // If all checks pass, increment the claimed count
    coupon.instancesClaimed += 1;
    await coupon.save();

    return res.status(200).json({
      message: "Coupon validated successfully.",
      valid: true,
      couponDetails: {
        frameSelection: coupon.frameSelection,
        noOfCopies: coupon.noOfCopies,
        remainingInstances: coupon.totalInstances - coupon.instancesClaimed
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};



const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('frameSelection').populate('noOfCopies')
    .sort({ createdAt: -1 });
    return res.status(200).json({ coupons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const deleteCopuponsById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("Server error", err);
    res.status(500).json({ message: err.message });
  } 
}

const getframeandnumberofcopiesdetails = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id).populate('frameSelection').populate('noOfCopies');
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ coupon });
  } catch (err) {
    console.error("Server error", err);
    res.status(500).json({ message: err.message });
  }
}
module.exports = {
  generateCoupon,
  validateCoupon,
  getAllCoupons,
  deleteCopuponsById,
  getframeandnumberofcopiesdetails
};