const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const User = require('../models/userModel');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createCustomer = async (req, res) => {
  const { userId } = req.body;
  console.log('userId:', userId);

  try {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId) || userId.length !== 24) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Find the user in the database using the validated userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User data:', user);

    const existingCustomers = await razorpayInstance.customers.all({
      contact: user.phone_Number || null,
      email: user.email || null,
    });

    if (existingCustomers && existingCustomers.items && existingCustomers.items.length > 0) {
      const existingCustomer = existingCustomers.items[0];
      console.log('Customer already exists (found by contact/email):', existingCustomer);

      // Check and update customer name if it's incorrect
      if (existingCustomer.name !== user.user_Name) {
        console.log('Customer name is incorrect, updating.');
        await razorpayInstance.customers.edit(existingCustomer.id, { name: user.user_Name });
        const updatedCustomer = await razorpayInstance.customers.fetch(existingCustomer.id);
        user.customer_id = updatedCustomer.id;
        await user.save();
        return res.status(200).json({ customer: updatedCustomer });
      }

      user.customer_id = existingCustomer.id;
      await user.save();
      return res.status(200).json({ customer: existingCustomer });
    }

    // Create customer on Razorpay with userId or unique name
    const options = {
      name: user.user_Name || `Customer-${userId}`,  // Make sure the name is unique
      email: user.email || null,
      contact: user.phone_Number || null,
    };

    console.log('Creating customer with the following details:', options);

    // Create customer on Razorpay
    const customer = await razorpayInstance.customers.create(options);
    console.log('Razorpay customer created:', customer);

    // Store the Razorpay customer_id in the MongoDB User document
    user.customer_id = customer.id;
    await user.save();

    res.status(200).json({ customer });
  } catch (error) {
    console.error('Error creating/fetching Razorpay customer:', error);
    res.status(500).json({ error: 'Failed to create/fetch Razorpay customer' });
  }
};


exports.generateQRCode = async (req, res) => {
  const { customer_id, name, payment_amount, description, notes } = req.body;

  if (!customer_id || !name || !payment_amount || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const options = {
    type: 'upi_qr',
    name: name,
    payment_amount: payment_amount,
    description: description,
    customer_id: customer_id,
    notes: notes || {},
    fixed_amount: true,
  };

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/payments/qr_codes',
      options,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    const qrCode = response.data;

    try {
      const user = await User.findOne({ customer_id: customer_id });

      if (!user) {
        return res.status(404).json({ error: 'User not found for the provided customer_id' });
      }

      user.qr_code_id = qrCode.id;
      await user.save();

      res.status(200).json(qrCode);
    } catch (userUpdateError) {
      console.error('Error updating User document:', userUpdateError);
      res.status(500).json({ error: 'Failed to update User document' });
    }
  } catch (error) {
    console.error('Error creating QR code:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create QR code' });
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

exports.getPaymentsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ user_id: userId });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments.' });
    }
};
