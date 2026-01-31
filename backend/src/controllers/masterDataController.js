// ============================================================================
// Master Data Controller
// Located: backend/src/controllers/masterDataController.js
// Handles: Analytics Codes, Products, Contacts, Partners
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// ANALYTICS CODES
// ============================================================================

// Create Analytics Code
// POST /api/analytics
const createAnalytics = async (req, res) => {
  try {
    const { event_name, partner_id, partner_tag, product_id, product_category, no_of_units, unit_price, profit, profit_margin_percentage } = req.body;

    if (!event_name || !partner_id || !product_id || !no_of_units || !unit_price) {
      return res.status(400).json({
        success: false,
        error: 'Event name, partner, product, units, and price are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO analytics (event_name, partner_tag, partner_id, product_id, product_category, no_of_units, unit_price, profit, profit_margin_percentage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_name, partner_tag || null, partner_id, product_id, product_category || null, no_of_units, unit_price, profit || 0, profit_margin_percentage || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Analytics record created successfully',
      data: {
        id: result.insertId,
        event_name,
        partner_id,
        partner_tag,
        product_id,
        product_category,
        no_of_units,
        unit_price,
        profit,
        profit_margin_percentage
      }
    });
  } catch (error) {
    console.error('Create analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create analytics record'
    });
  }
};

// Get All Analytics Codes
// GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const { event_name, partner_tag, search } = req.query;

    let query = 'SELECT a.*, p.name as product_name, c.name as partner_name FROM analytics a LEFT JOIN products p ON a.product_id = p.id LEFT JOIN contacts c ON a.partner_id = c.id WHERE 1=1';
    const params = [];

    if (event_name) {
      query += ' AND a.event_name = ?';
      params.push(event_name);
    }

    if (partner_tag) {
      query += ' AND a.partner_tag = ?';
      params.push(partner_tag);
    }

    if (search) {
      query += ' AND (a.event_name LIKE ? OR a.product_category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.created_at DESC';

    const [analytics] = await pool.query(query, params);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics records'
    });
  }
};

// Update Analytics Code
// PUT /api/analytics/:id
const updateAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, category } = req.body;

    const [existing] = await pool.query(
      'SELECT analytics_id FROM analytics_codes WHERE analytics_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Analytics code not found'
      });
    }

    await pool.query(
      'UPDATE analytics_codes SET code = ?, description = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE analytics_id = ?',
      [code, description, category || null, id]
    );

    res.json({
      success: true,
      message: 'Analytics code updated successfully'
    });
  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update analytics code'
    });
  }
};

// Delete Analytics Code
// DELETE /api/analytics/:id
const deleteAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT analytics_id FROM analytics_codes WHERE analytics_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Analytics code not found'
      });
    }

    await pool.query('DELETE FROM analytics_codes WHERE analytics_id = ?', [id]);

    res.json({
      success: true,
      message: 'Analytics code deleted successfully'
    });
  } catch (error) {
    console.error('Delete analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete analytics code'
    });
  }
};

// ============================================================================
// PRODUCTS
// ============================================================================

// Create Product
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, unit_price, tax_rate } = req.body;

    if (!name || !category || !unit_price) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and unit price are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, category, unit_price, tax_rate, status) VALUES (?, ?, ?, ?, "active")',
      [name, category, unit_price, tax_rate || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: result.insertId,
        name,
        category,
        unit_price,
        tax_rate: tax_rate || 0,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// Get All Products
// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name';

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// ============================================================================
// CONTACTS
// ============================================================================

// Create Contact
// POST /api/contacts
const createContact = async (req, res) => {
  try {
    const { name, type, email, phone, linked_user_id } = req.body;

    if (!name || !type || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and email are required'
      });
    }

    if (!['customer', 'vendor', 'partner'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be customer, vendor, or partner'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO contacts (name, type, email, phone, linked_user_id, status) VALUES (?, ?, ?, ?, ?, "active")',
      [name, type, email, phone || null, linked_user_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        id: result.insertId,
        name,
        type,
        email,
        phone: phone || null,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact'
    });
  }
};

// Get All Contacts
// GET /api/contacts
const getContacts = async (req, res) => {
  try {
    const { type, search } = req.query;

    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name';

    const [contacts] = await pool.query(query, params);

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
};

// ============================================================================
// PARTNERS
// ============================================================================

// Get All Partners
// GET /api/partners
const getPartners = async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT * FROM contacts WHERE type = 'partner'";
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const [partners] = await pool.query(query, params);

    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partners'
    });
  }
};

module.exports = {
  createAnalytics,
  getAnalytics,
  updateAnalytics,
  deleteAnalytics,
  createProduct,
  getProducts,
  createContact,
  getContacts,
  getPartners
};
