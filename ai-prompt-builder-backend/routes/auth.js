const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController'); // Import controller functions
const authMiddleware = require('../middleware/auth'); // Import auth middleware

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get logged in user data
// @access  Private (requires authentication)
router.get('/me', authMiddleware, getMe); // Use authMiddleware to protect this route

module.exports = router;
