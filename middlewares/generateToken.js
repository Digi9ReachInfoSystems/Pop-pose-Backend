const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here';  
const payload = {
  id: 1,          
  username: 'admin' 
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

console.log('Generated JWT Token:', token);
