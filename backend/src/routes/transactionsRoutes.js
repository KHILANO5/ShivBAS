// ============================================================================
// Transactions Routes
// Located: backend/src/routes/transactionsRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Transaction CRUD
router.post('/', authenticate, transactionsController.createTransaction);
router.get('/', authenticate, transactionsController.getTransactions);
router.get('/:id', authenticate, transactionsController.getTransactionById);
router.put('/:id', authenticate, transactionsController.updateTransaction);
router.delete('/:id', authenticate, requireAdmin, transactionsController.deleteTransaction);

// Transaction Actions
router.post('/:id/approve', authenticate, requireAdmin, transactionsController.approveTransaction);

module.exports = router;
