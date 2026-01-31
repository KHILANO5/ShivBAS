// ============================================================================
// Budgets Routes
// Located: backend/src/routes/budgetsRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const budgetsController = require('../controllers/budgetsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Budget CRUD
router.post('/', authenticate, budgetsController.createBudget);
router.get('/', authenticate, budgetsController.getBudgets);
router.get('/alerts', authenticate, budgetsController.getBudgetAlerts);
router.get('/:id', authenticate, budgetsController.getBudgetById);
router.put('/:id', authenticate, budgetsController.updateBudget);
router.delete('/:id', authenticate, requireAdmin, budgetsController.deleteBudget);

// Budget Revisions
router.get('/:id/revisions', authenticate, budgetsController.getBudgetRevisions);

module.exports = router;
