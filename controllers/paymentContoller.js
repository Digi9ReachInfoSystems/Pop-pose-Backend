const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const User = require('../models/userModel');  // Assuming you have a User model in MongoDB
const axios = require('axios');
const Payment = require('../models/paymentModel');
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createCustomer = async (req, res) => {
    const { userId } = req.body;
    console.log('userId:', userId);

    try {
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingCustomer = await razorpayInstance.customers.all({
            contact: user.phone_Number || null,
            email: user.email || null,
        });

        if (existingCustomer && existingCustomer.items && existingCustomer.items.length > 0) {
        
            console.log('Customer already exists:', existingCustomer.items[0]);

            // Update the user document with the existing Razorpay customer_id
            user.customer_id = existingCustomer.items[0].id;
            await user.save();  // Save the customer_id to MongoDB
            return res.status(200).json({ customer: existingCustomer.items[0] });
        }

        // Razorpay customer options
        const options = {
            name: user.user_Name,
            email: user.email || null,
            contact: user.phone_Number || null,
        };

        // Create customer on Razorpay
        const customer = await razorpayInstance.customers.create(options);

        // Store the Razorpay customer_id in the MongoDB User document
        user.customer_id = customer.id;  // Save Razorpay customer_id
        await user.save();  // Save the updated user with customer_id

        res.status(200).json({ customer });

    } catch (error) {
        console.error('Error creating Razorpay customer:', error);
        res.status(500).json({ error: 'Failed to create Razorpay customer' });
    }
};



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