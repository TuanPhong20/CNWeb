const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateProfile, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Routes công khai
router.post('/register', register);
router.post('/login', login);

// Routes yêu cầu xác thực
router.get('/me', verifyToken, getCurrentUser);
router.put('/me/profile', verifyToken, updateProfile);
router.put('/me/password', verifyToken, changePassword);

module.exports = router; 