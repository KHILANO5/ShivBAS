// ============================================================================
// Payments Routes
// Located: backend/src/routes/paymentsRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticate } = require('../middleware/auth');

// Payment operations
router.post('/', authenticate, paymentsController.recordPayment);
router.get('/', authenticate, paymentsController.getPayments);
router.get('/:id', authenticate, paymentsController.getPaymentById);
router.get('/transaction/:transaction_id', authenticate, paymentsController.getTransactionPayments);

module.exports = router;
