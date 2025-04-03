require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const axios = require("axios");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const mongoose = require("mongoose");



   



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

exports.generateQRCode = async (req, res) => {
    const { customer_id, type, name, usage, fixed_amount, payment_amount, description, notes } = req.body;

    console.log('Received request body:', req.body);

    try {
        // Verify if the customer exists in your database using customer_id (not ObjectId)
        const user = await User.findOne({ customer_id: customer_id });  // No need for ObjectId conversion

        if (!user) {
            return res.status(404).json({ error: 'User not found for the provided customerId' });
        }

        // Razorpay QR Code options
        const qrCodeOptions = {
            type: type || 'upi_qr',  // Default to 'upi_qr' if not provided
            name: name || 'poppose',  // Default to 'poppose' if not provided
            usage: usage || 'single_use',  // Default to 'single_use' if not provided
            fixed_amount: fixed_amount !== undefined ? fixed_amount : true,  // Default to true if not provided
            payment_amount: payment_amount || 100,  // Default to 100 if not provided
            description: description || 'pop pose',  // Default to 'pop pose' if not provided
            customer_id: customer_id,  // Razorpay customer ID
            notes: notes || { purpose: 'Test UPI QR Code notes' },  // Default notes if not provided
        };

        // Request for Razorpay QR Code
        const qrCodeResponse = await axios.post(
            'https://api.razorpay.com/v1/payments/qr_codes',
            qrCodeOptions,
            {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET,
                },
            }
        );

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
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Failed to generate Razorpay QR code' });
    }
};

// 3. Verify Payment
exports.checkPaymentStatus = async (req, res) => {
  const { qrCodeId } = req.params;
  console.log('Received qrCodeId:', qrCodeId);

  try {
    const endpoint = `https://api.razorpay.com/v1/payments/qr_codes/${qrCodeId}/payments`;

    const response = await axios.get(endpoint, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    });

    console.log('Payment status response:', response.data);

    if (response.data && response.data.items && response.data.items.length > 0) {
      const paymentDetails = response.data.items[0];
      const paymentStatus = paymentDetails.status;

      const qrCodeOwner = await User.findOne({ qr_code_id: qrCodeId });

      if (!qrCodeOwner) {
        return res.status(404).json({ error: 'User not found for the provided QR code' });
      }

      const newPayment = new Payment({
        user_id: qrCodeOwner._id,
        payer_user_id: paymentDetails.user_id,
        qr_code_id: qrCodeId,
        image_url: paymentDetails.image_url || '',
        customer_id: paymentDetails.customer_id,
        payment_amount: paymentDetails.amount / 100,
        description: paymentDetails.description || 'Payment for service',
        payment_completed: paymentStatus === 'captured',
      });

      await newPayment.save();

      qrCodeOwner.payment_Completed = paymentStatus === 'captured';
      qrCodeOwner.payment_Details = newPayment._id;
      qrCodeOwner.customer_id = paymentDetails.customer_id;
      qrCodeOwner.qr_code_id = qrCodeId;

      await qrCodeOwner.save();

      newPayment.payment_completed = paymentStatus === 'captured';
      await newPayment.save();

      res.status(200).json({
        message: 'Payment status fetched and updated successfully!',
        paymentStatus: paymentStatus,
        paymentDetails: newPayment,
        updatedUser: qrCodeOwner,
      });
    } else {
      res.status(404).json({ error: 'No payments found for the provided QR code.' });
    }
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status from Razorpay.' });
  }
};