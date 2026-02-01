const express = require('express');
const router = express.Router();
const razorpayController = require('../controllers/razorpayController');
const { authenticate } = require('../middleware/auth');

// Public route to get Razorpay key
router.get('/key', razorpayController.getKey);

// Protected routes
router.use(authenticate);

// Create order for payment
router.post('/create-order', razorpayController.createOrder);

// Verify payment after completion
router.post('/verify-payment', razorpayController.verifyPayment);

// Get invoice/bill balance - NEW
router.get('/balance/:invoice_type/:invoice_id', razorpayController.getInvoiceBalance);

// Direct payment (simulated - for demo)
router.post('/direct-payment', razorpayController.directPayment);

// Get payment status by order ID
router.get('/status/:order_id', razorpayController.getPaymentStatus);

// Get all payments
router.get('/payments', razorpayController.getAllPayments);

module.exports = router;
