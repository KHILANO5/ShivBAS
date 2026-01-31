// ============================================================================
// Purchase Orders Routes
// Located: backend/src/routes/purchaseOrdersRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const purchaseOrdersController = require('../controllers/purchaseOrdersController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, purchaseOrdersController.getPurchaseOrders);
router.get('/:id', authenticate, purchaseOrdersController.getPurchaseOrderById);
router.post('/', authenticate, purchaseOrdersController.createPurchaseOrder);
router.put('/:id', authenticate, purchaseOrdersController.updatePurchaseOrder);
router.delete('/:id', authenticate, purchaseOrdersController.deletePurchaseOrder);

module.exports = router;
