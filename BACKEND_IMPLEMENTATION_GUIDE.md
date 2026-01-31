# Backend Implementation Guide
## Node.js + Express Implementation Reference

**Target**: Build Express.js REST API endpoints that match API contracts  
**Framework**: Express.js 4.x  
**Authentication**: JWT (jsonwebtoken)  
**Hashing**: bcryptjs  
**Database**: MySQL (via connection pool in database.js)

---

## 📋 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── authorize.js         # Role-based access control
│   └── errorHandler.js      # Global error handling
├── routes/
│   ├── auth.js              # /auth/* endpoints
│   ├── analytics.js         # /analytics/* endpoints
│   ├── budgets.js           # /budgets/* endpoints
│   ├── invoices.js          # /invoices/* endpoints
│   ├── bills.js             # /bills/* endpoints
│   ├── payments.js          # /payments/* endpoints
│   ├── products.js          # /products/* endpoints
│   ├── contacts.js          # /contacts/* endpoints
│   └── dashboard.js         # /dashboard/* endpoints
├── controllers/
│   ├── authController.js
│   ├── analyticsController.js
│   ├── budgetsController.js
│   ├── invoicesController.js
│   ├── billsController.js
│   ├── paymentsController.js
│   ├── productsController.js
│   ├── contactsController.js
│   └── dashboardController.js
├── utils/
│   ├── validators.js        # Input validation
│   ├── helpers.js           # Utility functions
│   ├── jwt.js               # JWT token generation/verification
│   └── errorCodes.js        # Error definitions
├── app.js                   # Express app setup
├── server.js                # Server startup
└── .env.example             # Configuration template
```

---

## 🚀 Server Setup

### app.js
```javascript
// backend/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const budgetsRoutes = require('./routes/budgets');
const invoicesRoutes = require('./routes/invoices');
const billsRoutes = require('./routes/bills');
const paymentsRoutes = require('./routes/payments');
const productsRoutes = require('./routes/products');
const contactsRoutes = require('./routes/contacts');
const dashboardRoutes = require('./routes/dashboard');

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (optional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/budgets', authMiddleware, budgetsRoutes);
app.use('/api/invoices', authMiddleware, invoicesRoutes);
app.use('/api/bills', authMiddleware, billsRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/products', authMiddleware, productsRoutes);
app.use('/api/contacts', authMiddleware, contactsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    statusCode: 404,
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

### server.js
```javascript
// backend/server.js
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.SERVER_PORT || 5000;
const HOST = process.env.SERVER_HOST || 'localhost';

// Start server
app.listen(PORT, HOST, () => {
  console.log(`✅ ShivBAS API running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await db.closePool();
  process.exit(0);
});
```

---

## 🔐 Middleware

### auth.js
```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
        statusCode: 401,
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired JWT token',
      statusCode: 401,
    });
  }
};
```

### authorize.js
```javascript
// backend/middleware/authorize.js
module.exports = function authorize(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole && requiredRole !== 'any') {
      return res.status(403).json({
        success: false,
        error: `Only ${requiredRole}s can perform this action`,
        statusCode: 403,
      });
    }
    next();
  };
};
```

### errorHandler.js
```javascript
// backend/middleware/errorHandler.js
module.exports = function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Validation errors
  if (err.validationErrors) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      statusCode: 400,
      details: err.validationErrors,
    });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      statusCode: 409,
      details: err.message,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
  });
};
```

---

## 🔑 Authentication Routes

### routes/auth.js
```javascript
// backend/routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
```

### controllers/authController.js
```javascript
// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const validators = require('../utils/validators');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { login_id, email, password, name } = req.body;

    // Validation
    validators.validateRegistration({ login_id, email, password, name });

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE login_id = ? OR email = ?',
      [login_id, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'login_id or email already exists',
        statusCode: 409,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      'INSERT INTO users (login_id, email, password, name, signup_type) VALUES (?, ?, ?, ?, ?)',
      [login_id, email, hashedPassword, name, 'self_signup']
    );

    // Fetch created user
    const user = await db.query('SELECT id, login_id, email, name, role FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        ...user[0],
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        error: 'login_id and password required',
        statusCode: 400,
      });
    }

    // Find user
    const users = await db.query('SELECT * FROM users WHERE login_id = ?', [login_id]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid login_id or password',
        statusCode: 401,
      });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid login_id or password',
        statusCode: 401,
      });
    }

    // Generate tokens
    const token = generateToken(user, 'access');
    const refreshToken = generateToken(user, 'refresh');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          login_id: user.login_id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await db.query('SELECT id, login_id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    res.json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        statusCode: 400,
      });
    }

    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User with this email not found',
        statusCode: 404,
      });
    }

    // Generate reset token
    const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET, {
      expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRY || '30m',
    });

    // Save token to database
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await db.query(
      'INSERT INTO password_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [users[0].id, token, expiresAt]
    );

    // TODO: Send email with reset link
    console.log(`Reset token for ${email}: ${token}`);

    res.json({
      success: true,
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new_password required',
        statusCode: 400,
      });
    }

    // Validate password
    validators.validatePassword(new_password);

    // Find token
    const tokens = await db.query(
      'SELECT user_id FROM password_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
        statusCode: 400,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, tokens[0].user_id]
    );

    // Delete token
    await db.query('DELETE FROM password_tokens WHERE token = ?', [token]);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
        statusCode: 400,
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          statusCode: 404,
        });
      }

      const newToken = generateToken(user[0], 'access');
      const newRefreshToken = generateToken(user[0], 'refresh');

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        statusCode: 401,
      });
    }
  } catch (error) {
    next(error);
  }
};
```

---

## 🏢 Analytics Routes

### routes/analytics.js
```javascript
// backend/routes/analytics.js
const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authorize('admin'), analyticsController.createEvent);
router.get('/', analyticsController.getAllEvents);
router.get('/:id', analyticsController.getEventById);
router.put('/:id', authorize('admin'), analyticsController.updateEvent);

module.exports = router;
```

### controllers/analyticsController.js (Skeleton)
```javascript
// backend/controllers/analyticsController.js
const db = require('../config/database');

exports.createEvent = async (req, res, next) => {
  try {
    const { event_name, partner_tag, partner_id, product_id, no_of_units, unit_price, profit, profit_margin_percentage } = req.body;

    // TODO: Validate inputs
    // TODO: Check partner_id exists in contacts
    // TODO: Check product_id exists in products
    // TODO: Create event
    // TODO: Return created event

    res.status(201).json({
      success: true,
      message: 'Analytics event created',
      data: { /* event data */ },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const { skip = 0, limit = 10, event_name } = req.query;
    
    // TODO: Build query with filters
    // TODO: Fetch events
    // TODO: Return events with total count

    res.json({
      success: true,
      data: {
        total: 0,
        skip: parseInt(skip),
        limit: parseInt(limit),
        events: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // TODO: Fetch event by ID
    // TODO: Return 404 if not found

    res.json({
      success: true,
      data: { /* event data */ },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Validate and update event

    res.json({
      success: true,
      message: 'Event updated',
      data: { /* updated event */ },
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 💾 Budgets Routes

### routes/budgets.js
```javascript
// backend/routes/budgets.js
const express = require('express');
const budgetsController = require('../controllers/budgetsController');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authorize('admin'), budgetsController.createBudget);
router.get('/', budgetsController.getAllBudgets);
router.get('/:id', budgetsController.getBudgetById);
router.put('/:id', authorize('admin'), budgetsController.updateBudget);
router.post('/:id/revise', authorize('admin'), budgetsController.reviseBudget);
router.get('/:id/alerts', budgetsController.getBudgetAlerts);

module.exports = router;
```

---

## 📄 Invoices Routes

### routes/invoices.js
```javascript
// backend/routes/invoices.js
const express = require('express');
const invoicesController = require('../controllers/invoicesController');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', authorize('admin'), invoicesController.createInvoice);
router.get('/', invoicesController.getAllInvoices);
router.get('/:id', invoicesController.getInvoiceById);
router.post('/:id/post', authorize('admin'), invoicesController.postInvoice);
router.post('/:id/cancel', authorize('admin'), invoicesController.cancelInvoice);

module.exports = router;
```

### controllers/invoicesController.js (Key Logic)
```javascript
// backend/controllers/invoicesController.js (excerpt)
exports.postInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Start transaction
    await db.transaction(async (query) => {
      // 1. Get invoice
      const invoice = await query(
        'SELECT * FROM customer_invoices WHERE id = ?',
        [id]
      );

      if (invoice.length === 0) {
        throw { statusCode: 404, message: 'Invoice not found' };
      }

      if (invoice[0].status !== 'draft') {
        throw { statusCode: 400, message: 'Only draft invoices can be posted' };
      }

      // 2. Update invoice status
      await query(
        'UPDATE customer_invoices SET status = ? WHERE id = ?',
        ['posted', id]
      );

      // 3. Update budget achieved_amount
      const budget = await query(
        'SELECT id, budgeted_amount, achieved_amount FROM budgets WHERE id = ?',
        [invoice[0].analytics_id]
      );

      if (budget.length > 0) {
        const newAchieved = budget[0].achieved_amount + invoice[0].total_amount;
        await query(
          'UPDATE budgets SET achieved_amount = ? WHERE id = ?',
          [newAchieved, budget[0].id]
        );

        // 4. Check for alerts
        const percentage = (newAchieved / budget[0].budgeted_amount) * 100;
        if (percentage >= 80) {
          await query(
            'INSERT INTO budget_alerts (budget_id, alert_type, threshold_percentage) VALUES (?, ?, ?)',
            [budget[0].id, percentage >= 100 ? 'critical' : 'warning', percentage >= 100 ? 100 : 80]
          );
        }
      }

      // 5. Log audit
      await query(
        'INSERT INTO audit_logs (user_id, action, record_type, record_id) VALUES (?, ?, ?, ?)',
        [req.user.id, 'posted', 'invoice', id]
      );
    });

    res.json({
      success: true,
      message: 'Invoice posted and budget updated',
      data: { id, status: 'posted' },
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🛠️ Utility Functions

### utils/validators.js
```javascript
// backend/utils/validators.js
exports.validateRegistration = ({ login_id, email, password, name }) => {
  const errors = [];

  if (!login_id || login_id.length < 6 || login_id.length > 12) {
    errors.push({ field: 'login_id', message: 'login_id must be 6-12 chars' });
  }

  if (!email || !email.includes('@')) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!this.validatePassword(password)) {
    errors.push({ field: 'password', message: 'Password must meet complexity requirements' });
  }

  if (!name || name.length < 1) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.validationErrors = errors;
    throw err;
  }
};

exports.validatePassword = (password) => {
  const rules = {
    minLength: (process.env.MIN_PASSWORD_LENGTH || 8),
    requireUppercase: process.env.REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.REQUIRE_LOWERCASE !== 'false',
    requireSpecialChar: process.env.REQUIRE_SPECIAL_CHAR !== 'false',
  };

  if (password.length < rules.minLength) return false;
  if (rules.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (rules.requireLowercase && !/[a-z]/.test(password)) return false;
  if (rules.requireSpecialChar && !/[!@#$%^&*]/.test(password)) return false;

  return true;
};
```

### utils/jwt.js
```javascript
// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

exports.generateToken = (user, type = 'access') => {
  const expiresIn = type === 'refresh' 
    ? process.env.JWT_REFRESH_EXPIRY || '7d'
    : process.env.JWT_EXPIRY || '1h';

  return jwt.sign(
    {
      id: user.id,
      login_id: user.login_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

---

## 📦 package.json
```json
{
  "name": "shivbas-backend",
  "version": "1.0.0",
  "description": "ShivBAS Budget Accounting System API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0"
  }
}
```

---

## 🧪 Testing Endpoints

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login_id": "dev_user",
    "email": "dev@test.com",
    "password": "SecurePass@123",
    "name": "Dev User"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login_id": "admin_user",
    "password": "Test@123"
  }'
```

**Protected Request** (with JWT):
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Query Patterns

### Parameterized Queries (Prevent SQL Injection)
```javascript
// ✅ SAFE
const result = await db.query(
  'SELECT * FROM users WHERE login_id = ? AND status = ?',
  [login_id, 'active']
);

// ❌ UNSAFE (String concatenation)
const result = db.query(`SELECT * FROM users WHERE login_id = '${login_id}'`);
```

### Transactions (Multi-step Operations)
```javascript
// ✅ Atomic operation
await db.transaction(async (query) => {
  await query('INSERT INTO invoices ...', []);
  await query('UPDATE budgets ...', []);
  await query('INSERT INTO alerts ...', []);
  // All or nothing - if any fails, all rollback
});
```

### Common Query Patterns

**Create with ID return**:
```javascript
const result = await db.query('INSERT INTO table (...) VALUES (...)', []);
const id = result.insertId;
```

**Fetch with pagination**:
```javascript
const skip = parseInt(req.query.skip) || 0;
const limit = parseInt(req.query.limit) || 10;
const data = await db.query('SELECT * FROM table LIMIT ? OFFSET ?', [limit, skip]);
```

**Update and return**:
```javascript
await db.query('UPDATE table SET field = ? WHERE id = ?', [value, id]);
const updated = await db.query('SELECT * FROM table WHERE id = ?', [id]);
```

---

## 🚨 Error Handling Patterns

```javascript
// Try-catch-next pattern
exports.endpoint = async (req, res, next) => {
  try {
    // Your code
  } catch (error) {
    next(error); // Passes to error middleware
  }
};

// Validation errors
const err = new Error('Validation failed');
err.validationErrors = [{ field: 'email', message: 'Invalid format' }];
throw err;

// Custom errors
const err = new Error('Custom message');
err.statusCode = 400;
throw err;
```

---

## 📝 Implementation Checklist

### Sprint 1 (Auth & Dashboard)
- [ ] Implement auth routes (register, login, forgot-password)
- [ ] Implement auth controller with JWT
- [ ] Create protected route middleware
- [ ] Test login with curl
- [ ] Create admin dashboard controller
- [ ] Test dashboard summary endpoint

### Sprint 2 (Master Data)
- [ ] Implement analytics CRUD
- [ ] Implement products CRUD
- [ ] Implement contacts CRUD
- [ ] Add validation for each

### Sprint 3 (Transactions)
- [ ] Implement invoice creation
- [ ] Implement auto-assignment logic
- [ ] Implement post invoice (budget update)
- [ ] Implement bill creation

### Sprint 4 (Payments)
- [ ] Implement payment recording
- [ ] Update invoice payment status
- [ ] Create payment report endpoint

---

**Last Updated**: 2026-01-31  
**Ready for**: Node.js Backend Development
