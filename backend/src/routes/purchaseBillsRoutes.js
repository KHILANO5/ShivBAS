const express = require('express');
const router = express.Router();
const purchaseBillsController = require('../controllers/purchaseBillsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/purchase-bills - Get all purchase bills
router.get('/', purchaseBillsController.getPurchaseBills);

// GET /api/purchase-bills/:id - Get single purchase bill
router.get('/:id', purchaseBillsController.getPurchaseBillById);

// POST /api/purchase-bills - Create new purchase bill
router.post('/', purchaseBillsController.createPurchaseBill);

// PUT /api/purchase-bills/:id - Update purchase bill
router.put('/:id', purchaseBillsController.updatePurchaseBill);

// DELETE /api/purchase-bills/:id - Delete purchase bill
router.delete('/:id', purchaseBillsController.deletePurchaseBill);

module.exports = router;
