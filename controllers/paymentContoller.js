require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { 
      userId,
      frameId, 
      noOfCopiesId,
      amount,        
      currency = "INR",
      receipt = "receipt#1"
    } = req.body;


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2) Update user document with frame & copies (if that is your requirement)
    user.frame_Selection = frameId;
    user.no_of_copies = noOfCopiesId;
    await user.save(); 
    
    // 3) Prepare order options for Razorpay
    const options = {
      amount: amount * 100, // convert rupees to paise
      currency,
      receipt,
      notes: {
        userId: userId.toString(),
        frameId: frameId?.toString() || "",
        noOfCopiesId: noOfCopiesId?.toString() || "",
      },
    };

    // 4) Create order in Razorpay
    const order = await razorpayInstance.orders.create(options);
    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Order creation failed",
      });
    }

    // 5) Save payment details in MongoDB
    const paymentData = new Payment({
      user_Id: userId,
      paymentMethod: "Razorpay",
      payment_Completed: false,
      payment_Details: JSON.stringify(order),
      payment_method: "online", // or 'razorpay'
      
      // If you extended your Payment schema to hold these references, do:
      frame_Id: frameId,
      no_of_copies: noOfCopiesId,
    });

    await paymentData.save();

    // 6) Send response to client with the Razorpay order
    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      order, 
      paymentId: paymentData._id,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user_Id");
    return res.status(200).json(payments);
    } catch (error) {
        console.error("Error in getAllPayments:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            });
            }
        }


module.exports = {
  createOrder,
  getAllPayments
};


