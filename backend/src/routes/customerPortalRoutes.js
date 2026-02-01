// ============================================================================
// Customer Portal Routes
// Located: backend/src/routes/customerPortalRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', customerPortalController.getDashboard);

// Invoices
router.get('/invoices', customerPortalController.getInvoices);
router.get('/invoices/:id', customerPortalController.getInvoiceById);

// Bills
router.get('/bills', customerPortalController.getBills);

// Sale Orders
router.get('/sale-orders', customerPortalController.getSaleOrders);
router.get('/sale-orders/:id', customerPortalController.getSaleOrderById);

// Purchase Orders
router.get('/purchase-orders', customerPortalController.getPurchaseOrders);

// Payments
router.post('/pay-invoice', customerPortalController.createInvoicePayment);
router.post('/verify-payment', customerPortalController.verifyPayment);

module.exports = router;
