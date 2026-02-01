// ============================================================================
// Revised Budgets Routes
// Located: backend/src/routes/revisedBudgetsRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const revisedBudgetsController = require('../controllers/revisedBudgetsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Revised Budget CRUD
router.get('/', authenticate, revisedBudgetsController.getRevisedBudgets);
router.get('/:id', authenticate, revisedBudgetsController.getRevisedBudgetById);
router.post('/', authenticate, revisedBudgetsController.createRevisedBudget);
router.put('/:id', authenticate, revisedBudgetsController.updateRevisedBudget);
router.delete('/:id', authenticate, requireAdmin, revisedBudgetsController.deleteRevisedBudget);

module.exports = router;
