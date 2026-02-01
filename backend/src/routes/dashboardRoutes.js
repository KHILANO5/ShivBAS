// ============================================================================
// Dashboard Routes
// Located: backend/src/routes/dashboardRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Dashboard endpoints
router.get('/summary', authenticate, dashboardController.getDashboardSummary);
router.get('/budget-vs-actual', authenticate, dashboardController.getBudgetVsActual);
router.get('/transaction-report', authenticate, dashboardController.getTransactionReport);
router.get('/payment-status', authenticate, dashboardController.getPaymentStatus);

module.exports = router;
