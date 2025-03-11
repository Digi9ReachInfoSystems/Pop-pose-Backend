const bcrypt = require('bcryptjs');
const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const createAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });

        await newAdmin.save();

        res.status(201).send('Admin user created successfully');
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).send('Server error');
    }
};


const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request for username:', username);

    try {
        const admin = await Admin.findOne({ username });
        console.log('Admin found:', admin);

        if (!admin) return res.status(400).send('Admin not found');
        const isMatch = await bcrypt.compare(password.trim(), admin.password);
        console.log('Password match:', isMatch);

        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err); 
        res.status(500).send('Server error');
    }
};



const getAdminByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const admin = await Admin.findOne({ _id: userId });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (err) {
        console.error('Error during getAdminByUserId:', err);
        res.status(500).send('Server error');
    }

}

const getAdminFromToken = async (req, res) => {
    try {
        const { token } = req.body;
      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const adminId = decoded.id; 
        const adminUsername = decoded.username; 
        res.status(200).json({ success: true, data : { adminId, adminUsername } });
    } catch (error) {
        console.error('Invalid token or error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
module.exports = {
    createAdmin,
    loginAdmin,
    getAdminByUserId,
    getAdminFromToken
};
