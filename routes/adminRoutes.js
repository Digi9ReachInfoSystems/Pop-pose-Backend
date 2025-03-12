const express = require('express');
const adminController = require('../controllers/adminController');
const authenticateJWT = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', adminController.loginAdmin); 
router.post('/createAdmin', adminController.createAdmin);
router.get('/getAdminByUserId/:userId', adminController.getAdminByUserId);
router.post('/getAdminFromToken', adminController.getAdminFromToken);

module.exports = router;
