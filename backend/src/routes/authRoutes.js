// ============================================================================
// Authentication Routes
// Located: backend/src/routes/authRoutes.js
// Base Path: /api/auth
// ============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// User Registration
// POST /api/auth/register
router.post('/register', authController.register);

// User Login (Direct - no OTP)
// POST /api/auth/login
router.post('/login', authController.login);

// User Login with OTP - Step 1
// POST /api/auth/login-otp
router.post('/login-otp', authController.loginWithOTP);

// Verify OTP - Step 2
// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP
// POST /api/auth/resend-otp
router.post('/resend-otp', authController.resendOTP);

// Forgot Password - Request reset token
// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// Reset Password - Use token to set new password
// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// Refresh Access Token
// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Get Current User Info
// GET /api/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

// Update Profile
// PUT /api/auth/profile
router.put('/profile', authenticate, authController.updateProfile);

// Change Password
// POST /api/auth/change-password
router.post('/change-password', authenticate, authController.changePassword);

// Logout
// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;
