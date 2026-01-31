// ============================================================================
// Authentication Controller
// Located: backend/src/controllers/authController.js
// Handles: Registration, Login, Password Reset, Token Management
// ============================================================================

const bcrypt = require('bcryptjs');
const { pool } = require('../../config/database');
const { validatePassword, validateLoginId, validateEmail } = require('../utils/validation');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const crypto = require('crypto');

// ============================================================================
// USER REGISTRATION
// POST /api/auth/register
// ============================================================================
const register = async (req, res) => {
  try {
    const { login_id, email, password, name } = req.body;

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

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: result.insertId,
        login_id,
        email,
        name,
        role: 'portal'
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
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        error: 'Login ID and password are required'
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT id as user_id, login_id, email, password, name, role FROM users WHERE login_id = ?',
      [login_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid login_id or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          login_id: user.login_id,
          email: user.email,
          name: user.name,
          role: user.role
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
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
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
    const { email } = req.body;

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

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
