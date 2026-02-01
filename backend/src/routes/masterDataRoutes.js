// ============================================================================
// Master Data Routes
// Located: backend/src/routes/masterDataRoutes.js
// ============================================================================

const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Analytics Routes
router.post('/analytics', authenticate, requireAdmin, masterDataController.createAnalytics);
router.get('/analytics', authenticate, masterDataController.getAnalytics);
router.put('/analytics/:id', authenticate, requireAdmin, masterDataController.updateAnalytics);
router.delete('/analytics/:id', authenticate, requireAdmin, masterDataController.deleteAnalytics);

// Products Routes
router.post('/products', authenticate, requireAdmin, masterDataController.createProduct);
router.get('/products', authenticate, masterDataController.getProducts);
router.put('/products/:id', authenticate, requireAdmin, masterDataController.updateProduct);

// Contacts Routes
router.post('/contacts', authenticate, requireAdmin, masterDataController.createContact);
router.get('/contacts', authenticate, masterDataController.getContacts);
router.put('/contacts/:id', authenticate, requireAdmin, masterDataController.updateContact);
router.delete('/contacts/:id', authenticate, requireAdmin, masterDataController.deleteContact);

// Partners Routes
router.get('/partners', authenticate, masterDataController.getPartners);

module.exports = router;
