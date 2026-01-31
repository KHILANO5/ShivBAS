// ============================================================================
// ShivBAS Backend Server
// Main entry point for the application
// ============================================================================

const express = require('express');
const cors = require('cors');
const { testConnection } = require('../config/database');
const authRoutes = require('./routes/authRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');
const budgetsRoutes = require('./routes/budgetsRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true'
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication Routes
app.use('/api/auth', authRoutes);

// Master Data Routes (Analytics, Products, Contacts, Partners)
app.use('/api', masterDataRoutes);

// Budgets Routes
app.use('/api/budgets', budgetsRoutes);

// Transactions Routes (Invoices & Bills)
app.use('/api/transactions', transactionsRoutes);

// Payments Routes
app.use('/api/payments', paymentsRoutes);

// Dashboard Routes
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ShivBAS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Base Route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ShivBAS API - Budget Analytics System',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      analytics: '/api/analytics/*',
      products: '/api/products/*',
      contacts: '/api/contacts/*',
      budgets: '/api/budgets/*',
      transactions: '/api/transactions/*',
      payments: '/api/payments/*',
      dashboard: '/api/dashboard/*'
    }
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
  try {
    console.log('\n================================================================');
    console.log('           ShivBAS Backend Starting...                  ');
    console.log('================================================================');
    
    // Test database connection
    console.log('\nTesting database connection...');
    await testConnection();
    
    // Start server
    const PORT = process.env.SERVER_PORT || 5000;
    const HOST = process.env.SERVER_HOST || '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
      const env = process.env.NODE_ENV || 'development';
      console.log('\n================================================================');
      console.log(`  Server running on http://localhost:${PORT}`);
      console.log(`  Environment: ${env}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`  API Base: http://localhost:${PORT}/api`);
      console.log('================================================================\n');
      console.log('Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('\n[ERROR] Failed to start server:', error.message);
    console.error('Please check your configuration and try again.\n');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
