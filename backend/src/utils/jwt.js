// ============================================================================
// JWT Token Utilities
// Located: backend/src/utils/jwt.js
// ============================================================================

const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role, rememberMe = false) => {
  // If remember me: 30 days, otherwise: 24 hours
  const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRY || '24h');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const generateRefreshToken = (userId, rememberMe = false) => {
  // If remember me: 90 days, otherwise: 7 days
  const expiresIn = rememberMe ? '90d' : (process.env.JWT_REFRESH_EXPIRY || '7d');
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
