// ============================================================================
// Sale Orders Routes
// Located: backend/src/routes/saleOrdersRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const saleOrdersController = require('../controllers/saleOrdersController');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// GET /api/sale-orders - Get all sale orders
router.get('/', saleOrdersController.getSaleOrders);

// GET /api/sale-orders/:id - Get single sale order with items
router.get('/:id', saleOrdersController.getSaleOrderById);

// POST /api/sale-orders - Create new sale order
router.post('/', saleOrdersController.createSaleOrder);

// PUT /api/sale-orders/:id - Update sale order
router.put('/:id', saleOrdersController.updateSaleOrder);

// PATCH /api/sale-orders/:id/status - Update status only (confirm/cancel)
router.patch('/:id/status', saleOrdersController.updateSaleOrderStatus);

// DELETE /api/sale-orders/:id - Delete sale order
router.delete('/:id', saleOrdersController.deleteSaleOrder);

module.exports = router;
