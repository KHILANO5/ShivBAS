// ============================================================================
// Validation Utilities
// Located: backend/src/utils/validation.js
// ============================================================================

const validatePassword = (password) => {
  const minLength = parseInt(process.env.MIN_PASSWORD_LENGTH) || 8;
  const requireUppercase = process.env.PASSWORD_REQUIRE_UPPERCASE === 'true';
  const requireLowercase = process.env.PASSWORD_REQUIRE_LOWERCASE === 'true';
  const requireSpecial = process.env.PASSWORD_REQUIRE_SPECIAL_CHAR === 'true';

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateLoginId = (loginId) => {
  const minLength = parseInt(process.env.MIN_LOGIN_ID_LENGTH) || 6;
  const maxLength = parseInt(process.env.MAX_LOGIN_ID_LENGTH) || 12;

  const errors = [];

  if (loginId.length < minLength || loginId.length > maxLength) {
    errors.push(`Login ID must be between ${minLength} and ${maxLength} characters`);
  }
  if (!/^[a-zA-Z0-9_]+$/.test(loginId)) {
    errors.push('Login ID can only contain alphanumeric characters and underscores');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validatePassword,
  validateLoginId,
  validateEmail
};
