const mongoose = require("mongoose");
const Frame = require("../models/frameModel"); 
const NoOfCopies = require("../models/noofCopiesModel");  
const Coupon = require("../models/couponModel");  
const generateCouponCode = () => {
  return Math.random().toString(36).substr(2, 9); 
};


const generateCoupon = async (req, res) => {
  try {
    const { frameSelectionId, noOfCopiesId, totalInstances } = req.body;

    if (!frameSelectionId || !noOfCopiesId) {
      return res.status(400).json({ message: "Frame selection and number of copies are required." });
    }

    const frameSelection = await Frame.findById(frameSelectionId);
    if (!frameSelection) {
      return res.status(404).json({ message: "Invalid frame selection." });
    }
    const noOfCopies = await NoOfCopies.findById(noOfCopiesId);
    if (!noOfCopies) {
      return res.status(404).json({ message: "Invalid number of copies." });
    }

    const instances = totalInstances || 1;

    const couponCode = generateCouponCode();

    const newCoupon = new Coupon({
      code: couponCode,
      frameSelection: frameSelection._id,
      noOfCopies: noOfCopies._id,
      totalInstances: instances, 
      instancesClaimed: 0,
    });
    await newCoupon.save();

    return res.status(201).json({
      message: "Coupon generated successfully.",
      couponCode,
      frameSelection,
      noOfCopies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  generateCoupon,
};
