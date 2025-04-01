require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const axios = require("axios");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')




   



// exports.generateQRCode = async (req, res) => {
//     const { customer_id, type, name, usage, fixed_amount, payment_amount, description, notes } = req.body;

//     console.log('Received request body:', req.body);

//     try {
//         // Verify if the customer exists in your database using customer_id (not ObjectId)
//         const user = await User.findOne({ customer_id: customer_id });  // No need for ObjectId conversion

//         if (!user) {
//             return res.status(404).json({ error: 'User not found for the provided customerId' });
//         }

//         // Razorpay QR Code options
//         const qrCodeOptions = {
//             type: type || 'upi_qr',  // Default to 'upi_qr' if not provided
//             name: name || 'poppose',  // Default to 'poppose' if not provided
//             usage: usage || 'single_use',  // Default to 'single_use' if not provided
//             fixed_amount: fixed_amount !== undefined ? fixed_amount : true,  // Default to true if not provided
//             payment_amount: payment_amount || 100,  // Default to 100 if not provided
//             description: description || 'pop pose',  // Default to 'pop pose' if not provided
//             customer_id: customer_id,  // Razorpay customer ID
//             notes: notes || { purpose: 'Test UPI QR Code notes' },  // Default notes if not provided
//         };

//         // Request for Razorpay QR Code
//         const qrCodeResponse = await axios.post(
//             'https://api.razorpay.com/v1/payments/qr_codes',
//             qrCodeOptions,
//             {
//                 auth: {
//                     username: process.env.RAZORPAY_KEY_ID,
//                     password: process.env.RAZORPAY_KEY_SECRET,
//                 },
//             }
//         );

//         console.log('QR Code generated:', qrCodeResponse.data);

//         // Get the QR code ID from the response
//         const qrCodeId = qrCodeResponse.data.id;

//         // Save the QR code ID to the User document in MongoDB
//         const updatedUser = await User.findOneAndUpdate(
//             { customer_id: customer_id },  // Find the user by customer_id
//             { qr_code_id: qrCodeId },  // Update the user with the QR code ID
//             { new: true }  // Return the updated document
//         );

//         if (!updatedUser) {
//             console.error('Failed to update user with QR code ID');
//             return res.status(500).json({ error: 'Failed to update user with QR code ID' });
//         }

//         // Return the QR code data (including the qr_id and image_url)
//         res.status(200).json({
//             qrCode: qrCodeResponse.data,
//             message: 'QR code generated and saved successfully!',
//             updatedUser: updatedUser,  // Returning the updated user details
//         });
//     } catch (error) {
//         console.error('Error generating QR code:', error);
//         res.status(500).json({ error: 'Failed to generate Razorpay QR code' });
//     }
// };

// exports.generateQRCode = async (req, res) => {
//     const { customer_id, type, name, usage, fixed_amount, payment_amount, description, notes } = req.body;

//     console.log('Received request body:', req.body);

//     try {
//         // Verify if the customer exists in your database using customer_id (not ObjectId)
//         const user = await User.findOne({ customer_id: customer_id });  // No need for ObjectId conversion

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

        console.log('QR Code generated:', qrCodeResponse.data);

        // Check if Razorpay QR Code response contains valid data
        if (!qrCodeResponse.data || !qrCodeResponse.data.id) {
            console.error('Invalid response from Razorpay for QR code');
            return res.status(500).json({ error: 'Invalid response from Razorpay for QR code generation' });
        }

        // Get the QR code ID from the response
        const qrCodeId = qrCodeResponse.data.id;

        // Save the QR code ID to the User document in MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { customer_id: customer_id },  // Find the user by customer_id
            { qr_code_id: qrCodeId },  // Update the user with the QR code ID
            { new: true, upsert: false }  // Return the updated document, don't create a new user if it doesn't exist
        );

        if (!updatedUser) {
            console.error('Failed to update user with QR code ID');
            return res.status(500).json({ error: 'Failed to update user with QR code ID' });
        }

        console.log('User updated with QR code ID:', updatedUser);

        // Return the QR code data (including the qr_id and image_url)
        res.status(200).json({
            qrCode: qrCodeResponse.data,
            message: 'QR code generated and saved successfully!',
            updatedUser: updatedUser,  // Returning the updated user details
        });
//     } catch (error) {
//         console.error('Error generating QR code:', error);
//         res.status(500).json({ error: 'Failed to generate Razorpay QR code' });
//     }
};



exports.checkPaymentStatus = async (req, res) => {
    const { qrCodeId } = req.params; // Pass the QR code ID in the request body
    console.log('Received qrCodeId:', qrCodeId);

    try {
        // Endpoint to get payment status for the QR code
        const endpoint = `https://api.razorpay.com/v1/payments/qr_codes/${qrCodeId}/payments`;

        // Make the request to the Razorpay API
        const response = await axios.get(endpoint, {
            auth: {
                username: process.env.RAZORPAY_KEY_ID,
                password: process.env.RAZORPAY_KEY_SECRET,
            },
        });

        console.log('Payment status response:', response.data);

        // Check if payment information exists in the response
        if (response.data && response.data.items && response.data.items.length > 0) {
            const paymentDetails = response.data.items[0];
            const paymentStatus = paymentDetails.status; // Get the payment status

            // Find the user associated with this QR code
            const user = await User.findOne({ qr_code_id: qrCodeId });

            if (!user) {
                return res.status(404).json({ error: 'User not found for the provided QR code' });
            }

            // Create a new payment document in the payment collection
            const newPayment = new Payment({
                user_id: user._id,
                qr_code_id: qrCodeId,
                image_url: paymentDetails.image_url || '',
                customer_id: paymentDetails.customer_id,
                payment_amount: paymentDetails.amount,
                description: paymentDetails.description || 'Payment for service',
                payment_success: paymentStatus === 'captured', // Mark as true if the payment was successful
            });

            // Save the payment details to the Payment collection
            await newPayment.save();

            // Update user collection: set payment_Completed to true and reference the payment details
            user.payment_Completed = paymentStatus === 'captured';
            user.payment_Details = newPayment._id; // Reference to the payment document
            await user.save();

            // Also update payment_success in payment document
            newPayment.payment_success = paymentStatus === 'captured';
            await newPayment.save();

            // Respond with success
            res.status(200).json({
                message: 'Payment status fetched and updated successfully!',
                paymentStatus: paymentStatus,
                paymentDetails: newPayment,
                updatedUser: user,
            });
        } else {
            // If no payment info is found
            res.status(404).json({ error: 'No payments found for the provided QR code.' });
        }
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ error: 'Failed to fetch payment status from Razorpay.' });
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