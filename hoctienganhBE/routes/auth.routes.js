const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Routes công khai
router.post('/register', register);
router.post('/login', login);

// Routes yêu cầu xác thực
router.get('/me', verifyToken, getCurrentUser);

module.exports = router; 