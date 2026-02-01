// ============================================================================
// Authentication Controller
// Located: backend/src/controllers/authController.js
// Handles: Registration, Login, Password Reset, Token Management
// ============================================================================

const bcrypt = require('bcryptjs');
const { pool } = require('../../config/database');
const { validatePassword, validateLoginId, validateEmail } = require('../utils/validation');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { sendLoginWelcomeEmail } = require('../utils/email');
const crypto = require('crypto');

// ============================================================================
// USER REGISTRATION
// POST /api/auth/register
// ============================================================================
const register = async (req, res) => {
  try {
    const { login_id, password, name } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    // Validate required fields
    if (!login_id || !email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate login_id
    const loginIdValidation = validateLoginId(login_id);
    if (!loginIdValidation.valid) {
      return res.status(400).json({
        success: false,
        error: loginIdValidation.errors[0]
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.errors[0]
      });
    }

    // Check if login_id already exists
    const [existingLoginId] = await pool.query(
      'SELECT id FROM users WHERE login_id = ?',
      [login_id]
    );

    if (existingLoginId.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'login_id already exists'
      });
    }

    // Check if email already exists
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (login_id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [login_id, email, hashedPassword, name, 'portal']
    );

    const user_id = result.insertId;

    // Generate tokens for auto-login
    const accessToken = generateAccessToken(user_id, 'portal');
    const refreshToken = generateRefreshToken(user_id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id,
          login_id,
          email,
          name,
          role: 'portal'
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// ============================================================================
// USER LOGIN
// POST /api/auth/login
// ============================================================================
const login = async (req, res) => {
  try {
    const { login_id, password, remember } = req.body;
    const rememberMe = remember === true;

    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        error: 'Login ID and password are required'
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT id, login_id, email, password, name, role, signup_type, status, created_at, updated_at FROM users WHERE login_id = ?',
      [login_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Wrong username or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended or deactivated. Please contact the administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Wrong username or password'
      });
    }

    // Generate tokens with remember me support (use user.id, not user.user_id)
    const accessToken = generateAccessToken(user.id, user.role, rememberMe);
    const refreshToken = generateRefreshToken(user.id, rememberMe);

    // Send welcome notification email (don't wait for it)
    sendLoginWelcomeEmail(user.email, user.name).catch(err => {
      console.log('Welcome email sending failed:', err.message);
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.id,
          login_id: user.login_id,
          email: user.email,
          name: user.name,
          role: user.role,
          signup_type: user.signup_type,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// ============================================================================
// GET CURRENT USER
// GET /api/auth/me
// ============================================================================
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      'SELECT id, login_id, email, name, role, signup_type, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          user_id: user.id,
          login_id: user.login_id,
          email: user.email,
          name: user.name,
          role: user.role,
          signup_type: user.signup_type,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
};

// ============================================================================
// LOGOUT
// POST /api/auth/logout
// ============================================================================
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ============================================================================
// REFRESH TOKEN
// POST /api/auth/refresh-token
// ============================================================================
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    // Verify user exists
    const [users] = await pool.query(
      'SELECT id as user_id, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.user_id, user.role);
    const newRefreshToken = generateRefreshToken(user.user_id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

// ============================================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================================
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT id as user_id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User with this email not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, users[0].user_id]
    );

    // In hackathon mode, return token directly
    if (process.env.HACKATHON_MODE === 'true') {
      return res.json({
        success: true,
        message: 'Password reset link sent to email',
        data: {
          resetToken // Only for hackathon/testing
        }
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset request failed'
    });
  }
};

// ============================================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================================
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.errors[0]
      });
    }

    // Find user with valid token
    const [users] = await pool.query(
      'SELECT id as user_id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].user_id]
    );

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
};

// ============================================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'At least one field is required to update'
      });
    }

    // Check if email already exists (if updating email)
    if (email) {
      const emailLower = email.toLowerCase().trim();
      const [existingEmail] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [emailLower, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email.toLowerCase().trim());
    }

    params.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated user
    const [users] = await pool.query(
      'SELECT id as user_id, login_id, email, name, role, signup_type, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// ============================================================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// ============================================================================
const changePassword = async (req, res) => {
  try {
    console.log('Change password request received for user:', req.user.userId); // Debug log
    console.log('Request body:', { ...req.body, current_password: '***', new_password: '***' }); // Debug log (hide passwords)
    
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      console.log('Missing required fields'); // Debug log
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.errors[0]
      });
    }

    // Get user
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, users[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log('Password updated successfully for user:', userId); // Debug log

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// ============================================================================
// LOGIN WITH OTP - Step 1: Validate credentials and send OTP
// POST /api/auth/login-otp
// ============================================================================
const loginWithOTP = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        error: 'Login ID and password are required'
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT id, login_id, email, password, name, role, status FROM users WHERE login_id = ?',
      [login_id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Wrong username or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended or deactivated.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Wrong username or password'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [otp, otpExpiry, user.id]
    );

    // Send OTP via email
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      // Still allow login for development - remove this in production
      return res.json({
        success: true,
        message: 'OTP sent to your email',
        data: {
          user_id: user.id,
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
          otp_required: true,
          // For development only - remove in production:
          dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        user_id: user.id,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        otp_required: true
      }
    });
  } catch (error) {
    console.error('Login OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// ============================================================================
// VERIFY OTP - Step 2: Verify OTP and complete login
// POST /api/auth/verify-otp
// ============================================================================
const verifyOTP = async (req, res) => {
  try {
    const { user_id, otp, remember } = req.body;
    const rememberMe = remember === true;

    if (!user_id || !otp) {
      return res.status(400).json({
        success: false,
        error: 'User ID and OTP are required'
      });
    }

    // Find user with OTP
    const [users] = await pool.query(
      'SELECT id, login_id, email, name, role, signup_type, status, reset_token, reset_token_expiry, created_at, updated_at FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Check OTP
    if (user.reset_token !== otp) {
      return res.status(401).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(401).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Clear OTP
    await pool.query(
      'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role, rememberMe);
    const refreshToken = generateRefreshToken(user.id, rememberMe);

    // Send login success email notification
    sendLoginSuccessEmail(user.email, user.name).catch(err => {
      console.error('Failed to send login success email:', err);
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.id,
          login_id: user.login_id,
          email: user.email,
          name: user.name,
          role: user.role,
          signup_type: user.signup_type,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'OTP verification failed'
    });
  }
};

// ============================================================================
// RESEND OTP
// POST /api/auth/resend-otp
// ============================================================================
const resendOTP = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT id, email, name, status FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [otp, otpExpiry, user.id]
    );

    // Send OTP
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: 'OTP resent to your email',
      data: {
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        // For development only:
        dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
};

module.exports = {
  register,
  login,
  loginWithOTP,
  verifyOTP,
  resendOTP,
  getCurrentUser,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword
};
