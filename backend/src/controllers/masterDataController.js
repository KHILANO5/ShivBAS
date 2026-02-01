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
    const { event_name, partner_tag, partner_id, product_id, product_category, no_of_units, unit_price, profit, profit_margin_percentage, status } = req.body;

    // Check if analytics record exists
    const [existing] = await pool.query(
      'SELECT id FROM analytics WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Analytics record not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (event_name !== undefined) {
      updates.push('event_name = ?');
      params.push(event_name);
    }
    if (partner_tag !== undefined) {
      updates.push('partner_tag = ?');
      params.push(partner_tag);
    }
    if (partner_id !== undefined) {
      updates.push('partner_id = ?');
      params.push(partner_id);
    }
    if (product_id !== undefined) {
      updates.push('product_id = ?');
      params.push(product_id);
    }
    if (product_category !== undefined) {
      updates.push('product_category = ?');
      params.push(product_category);
    }
    if (no_of_units !== undefined) {
      updates.push('no_of_units = ?');
      params.push(no_of_units);
    }
    if (unit_price !== undefined) {
      updates.push('unit_price = ?');
      params.push(unit_price);
    }
    if (profit !== undefined) {
      updates.push('profit = ?');
      params.push(profit);
    }
    if (profit_margin_percentage !== undefined) {
      updates.push('profit_margin_percentage = ?');
      params.push(profit_margin_percentage);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE analytics SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated analytics record
    const [updated] = await pool.query(
      'SELECT * FROM analytics WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Analytics record updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update analytics record'
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
    const { name, category, unit_price, purchase_price, tax_rate } = req.body;

    if (!name || !category || !unit_price) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and unit price are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, category, unit_price, purchase_price, tax_rate, status) VALUES (?, ?, ?, ?, ?, "active")',
      [name, category, unit_price, purchase_price || 0, tax_rate || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: result.insertId,
        name,
        category,
        unit_price,
        purchase_price: purchase_price || 0,
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

// Update Product
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit_price, purchase_price, tax_rate, status } = req.body;

    // Check if product exists
    const [existing] = await pool.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (unit_price !== undefined) {
      updates.push('unit_price = ?');
      params.push(unit_price);
    }
    if (purchase_price !== undefined) {
      updates.push('purchase_price = ?');
      params.push(purchase_price);
    }
    if (tax_rate !== undefined) {
      updates.push('tax_rate = ?');
      params.push(tax_rate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated product
    const [updated] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
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
    console.log('Create contact request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { name, type, email, phone, street, city, state, country, pincode, tags, image_url, linked_user_id } = req.body;

    if (!name || !type) {
      console.log('Validation failed: name or type missing');
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    if (!['customer', 'vendor', 'partner'].includes(type)) {
      console.log('Validation failed: invalid type');
      return res.status(400).json({
        success: false,
        error: 'Type must be customer, vendor, or partner'
      });
    }

    console.log('Inserting contact into database...');
    const [result] = await pool.query(
      'INSERT INTO contacts (name, type, email, phone, street, city, state, country, pincode, tags, image_url, linked_user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")',
      [name, type, email || null, phone || null, street || null, city || null, state || null, country || null, pincode || null, tags || null, image_url || null, linked_user_id || null]
    );

    console.log('Contact created successfully with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        id: result.insertId,
        name,
        type,
        email: email || null,
        phone: phone || null,
        street: street || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        tags: tags || null,
        image_url: image_url || null,
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

// Update Contact
// PUT /api/contacts/:id
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, email, phone, street, city, state, country, pincode, tags, image_url, linked_user_id, status } = req.body;

    // Check if contact exists
    const [existing] = await pool.query(
      'SELECT id FROM contacts WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (type !== undefined) {
      if (!['customer', 'vendor', 'partner'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be customer, vendor, or partner'
        });
      }
      updates.push('type = ?');
      params.push(type);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (street !== undefined) {
      updates.push('street = ?');
      params.push(street);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      params.push(city);
    }
    if (state !== undefined) {
      updates.push('state = ?');
      params.push(state);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      params.push(country);
    }
    if (pincode !== undefined) {
      updates.push('pincode = ?');
      params.push(pincode);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(tags);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (linked_user_id !== undefined) {
      updates.push('linked_user_id = ?');
      params.push(linked_user_id);
    }
    if (status !== undefined) {
      if (!['active', 'archived'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be active or archived'
        });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.query(
      `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

// Delete Contact
// DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const [existing] = await pool.query(
      'SELECT id FROM contacts WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Check if contact is used in transactions
    const [transactions] = await pool.query(
      'SELECT id FROM transactions WHERE contact_id = ? LIMIT 1',
      [id]
    );

    if (transactions.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete contact that is used in transactions. Consider archiving instead.'
      });
    }

    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
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
  updateProduct,
  createContact,
  getContacts,
  updateContact,
  deleteContact,
  getPartners
};
