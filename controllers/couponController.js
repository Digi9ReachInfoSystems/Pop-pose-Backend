const mongoose = require("mongoose");
const Frame = require("../models/frameModel");  // Import Frame model
const NoOfCopies = require("../models/noofCopiesModel");  // Import NoOfCopies model
const Coupon = require("../models/couponModel");  // Import Coupon model

// Function to generate a coupon code
const generateCouponCode = () => {
  return Math.random().toString(36).substr(2, 9); // Generates a random 9-character string
};

// Controller to handle coupon generation
const generateCoupon = async (req, res) => {
  try {
    const { frameSelectionId, noOfCopiesId, totalInstances } = req.body;

    // Check if both frameSelectionId and noOfCopiesId are provided
    if (!frameSelectionId || !noOfCopiesId) {
      return res.status(400).json({ message: "Frame selection and number of copies are required." });
    }

    // Check if the frame selection exists
    const frameSelection = await Frame.findById(frameSelectionId);
    if (!frameSelection) {
      return res.status(404).json({ message: "Invalid frame selection." });
    }

    // Check if the number of copies exists
    const noOfCopies = await NoOfCopies.findById(noOfCopiesId);
    if (!noOfCopies) {
      return res.status(404).json({ message: "Invalid number of copies." });
    }

    // Default to 5 instances if not provided
    const instances = totalInstances || 1;

    // Generate the coupon code
    const couponCode = generateCouponCode();

    // Create a new coupon
    const newCoupon = new Coupon({
      code: couponCode,
      frameSelection: frameSelection._id,
      noOfCopies: noOfCopies._id,
      totalInstances: instances,  // Use the provided or default value
      instancesClaimed: 0,
    });

    // Save the coupon to the database
    await newCoupon.save();

    // Respond with the coupon code
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
