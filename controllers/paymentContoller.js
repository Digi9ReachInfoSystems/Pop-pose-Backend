require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");



exports.createOrder = async (req, res) => {
    try {
        const {
            userId,
            amount,
            currency = "INR",
            receipt = "receipt#1"
        } = req.body;
        console.log("Razorpay", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await user.save();

        // 3) Prepare order options for Razorpay
        const options = {
            amount: amount * 100, // convert rupees to paise
            currency,
            receipt,
            notes: {
                userId: userId.toString(),
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
            order_id: order.id,
            reciept_id: order.receipt

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

exports.getAllPayments = async (req, res) => {
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

exports.verifyPayment = async (req, res) => {
    const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const signature = req.headers["x-razorpay-signature"];
    const secrete = "pop-pose-backendaqsedrftgty";
    const generated_signature = crypto.createHmac("sha256", secrete);
    generated_signature.update(JSON.stringify(req.body));
    const digested_signature = generated_signature.digest("hex");
    console.log("body", req.body);

    if (digested_signature === signature) {
        if (req.body.event == "payment.captured") {
            console.log(req.body.payload.payment);
            const payment = await Payment.find({ order_id: req.body.payload.payment.entity.order_id });
            if (!payment) {
                return res.status(200).json({ message: "Payment not found" });
            }
            payment.payment_Completed = true;
            await payment.save(); t
            console.log("Payment link paid, custom package updated successfully");
        }
    } else {
        console.log("Invalid signature");
    }

    res.json({ status: "ok" });
};



exports.getPaymentByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ user_Id: userId });
        return res.status(200).json(payments);
    } catch (error) {
        console.error("Error in getPaymentByUserId:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};