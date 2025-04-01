require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const axios = require("axios");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')


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
        key_id: process.env.RAZORPAY_KEY_ID_PROD,
        key_secret: process.env.RAZORPAY_KEY_SECRET_PROD,
    });
    const signature = req.headers["x-razorpay-signature"];
    const secrete = "popandposeaqawesrdtfyguhij";
    const generated_signature = crypto.createHmac("sha256", secrete);
    generated_signature.update(JSON.stringify(req.body));
    const digested_signature = generated_signature.digest("hex");
    console.log("body", req.body);
    console.log("sig", signature);
    console.log("dig", digested_signature);
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;
    const webhookSecret = 'popandposeaqawesrdtfyguhij';  // Replace with your actual webhook secret

    const isValidSignature = validateWebhookSignature(
        JSON.stringify(webhookBody),
        webhookSignature,
        webhookSecret
    );
    console.log("isValidSignature", isValidSignature);
    console.log("isValidSignature", digested_signature === signature);
    // if (digested_signature === signature) {
        if (req.body.event == "qr_code.credited") {
            console.log(req.body.payload.qr_code.entity);
            const payment = await Payment.findOne({ customer_Id: req.body.payload.payment.entity.customer_id, qrId: req.body.payload.qr_code.entity.id });
            console.log("payment", payment);
            payment.payment_Completed = true;
            payment.paymentId = req.body.payload.payment.entity.id;
            await payment.save();
            if (!payment) {
                return res.status(200).json({ message: "Payment not found" });
            }
            payment.payment_Completed = true;
            await payment.save(); 
            console.log("Payment link paid, custom package updated successfully");
        }
    // } else {
    //     console.log("Invalid signature");
    // }

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

exports.createPayment = async (req, res) => {
    try {
        const { user_Id, amount } = req.body;
        const user = await User.findById(user_Id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID_PROD,
            key_secret: process.env.RAZORPAY_KEY_SECRET_PROD,
        });
        const customer = await axios.post("https://api.razorpay.com/v1/customers", {
            name: user.user_Name,
            // email: user.email,
            contact: user.phone_Number,
            fail_existing: "0",
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID_PROD}:${process.env.RAZORPAY_KEY_SECRET_PROD}`).toString("base64")}`,
            },
        });
        console.log("customer", customer);
        const closeByTimestamp = (Math.floor(Date.now() / 1000))+130;
        const qrCode=await razorpayInstance.qrCode.create({
            type: "upi_qr",
            usage: "single_use",
            fixed_amount: true,
            payment_amount: (amount * 100),
            customer_id: customer.data.id,
            close_by: closeByTimestamp
          })
        // const qrCode = await axios.post("https://api.razorpay.com/v1/payments/qr_codes", {
        //     type: "upi_qr",
        //     usage: "single_use",
        //     fixed_amount: true,
        //     payment_amount: (amount * 100),
        //     customer_id: customer.data.id,
        //     close_by: 1681615838,
        // }, {
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID_PROD}:${process.env.RAZORPAY_KEY_SECRET_PROD}`).toString("base64")}`,
        //     },
        // });
        const paymentData = new Payment({
            user_Id: user_Id,
            payment_method: "upi_qr",
            payment_Completed: false,
            qrId: qrCode.id,
            customer_Id: customer.data.id
        })
        const payment = await paymentData.save();
        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            customerId: customer.data.id,
            qrCodeId: qrCode.id,
            qrCode: qrCode.image_url,
            close_by: qrCode.close_by

        });
    } catch (error) {
        console.error("Error in createPayment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error
        });
    }
};
exports.getPaymentStatus = async (req, res) => {
    try {
        const { userId, qrId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const payment = await Payment.findOne({ user_Id: user._id, qrId: qrId }).populate("user_Id").lean();
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Payment status fetched successfully",
            payment: payment,
        });
    } catch (error) {
        console.error("Error in getPaymentStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};