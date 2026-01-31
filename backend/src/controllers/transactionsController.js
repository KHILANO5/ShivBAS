// ============================================================================
// Transactions Controller
// Located: backend/src/controllers/transactionsController.js
// Handles: Invoices (Sales) and Bills (Purchase)
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// CREATE TRANSACTION (Invoice or Bill)
// POST /api/transactions
// ============================================================================
const createTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      transaction_type, 
      contact_id, 
      transaction_date, 
      due_date, 
      items, 
      notes 
    } = req.body;
    const user_id = req.user.user_id;

    if (!transaction_type || !contact_id || !transaction_date || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transaction type, contact, date, and items are required'
      });
    }

    if (!['invoice', 'bill'].includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        error: 'Transaction type must be either "invoice" or "bill"'
      });
    }

    await connection.beginTransaction();

    // Calculate total amount
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Insert transaction
    const [transactionResult] = await connection.query(
      `INSERT INTO transactions 
       (transaction_type, contact_id, transaction_date, due_date, total_amount, status, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [transaction_type, contact_id, transaction_date, due_date, total_amount, notes || null, user_id]
    );

    const transaction_id = transactionResult.insertId;

    // Insert transaction items
    for (const item of items) {
      await connection.query(
        `INSERT INTO transaction_items 
         (transaction_id, product_id, analytics_code_id, description, quantity, unit_price, amount) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction_id,
          item.product_id || null,
          item.analytics_code_id,
          item.description,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `${transaction_type === 'invoice' ? 'Invoice' : 'Bill'} created successfully`,
      data: {
        transaction_id,
        transaction_type,
        total_amount,
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// GET ALL TRANSACTIONS
// GET /api/transactions
// ============================================================================
const getTransactions = async (req, res) => {
  try {
    const { type, status } = req.query;

    // Query both invoices and bills
    let transactions = [];
    
    if (!type || type === 'invoice') {
      const [invoices] = await pool.query(`
        SELECT i.*, 'invoice' as transaction_type, c.name as contact_name, u.name as created_by_name
        FROM customer_invoices i
        LEFT JOIN contacts c ON i.customer_id = c.id
        LEFT JOIN users u ON i.created_by_user_id = u.id
        WHERE 1=1
        ${status ? 'AND i.status = ?' : ''}
        ORDER BY i.created_at DESC
      `, status ? [status] : []);
      transactions = transactions.concat(invoices);
    }
    
    if (!type || type === 'bill') {
      const [bills] = await pool.query(`
        SELECT b.*, 'bill' as transaction_type, c.name as contact_name, u.name as created_by_name
        FROM vendor_bills b
        LEFT JOIN contacts c ON b.vendor_id = c.id
        LEFT JOIN users u ON b.created_by_user_id = u.id
        WHERE 1=1
        ${status ? 'AND b.status = ?' : ''}
        ORDER BY b.created_at DESC
      `, status ? [status] : []);
      transactions = transactions.concat(bills);
    }

    // Sort combined results by created_at
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

// ============================================================================
// GET TRANSACTION BY ID
// GET /api/transactions/:id
// ============================================================================
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction details
    const [transactions] = await pool.query(
      `SELECT t.*, c.contact_name, c.email, c.phone, u.name as created_by_name
       FROM transactions t
       LEFT JOIN contacts c ON t.contact_id = c.contact_id
       LEFT JOIN users u ON t.created_by = u.user_id
       WHERE t.transaction_id = ?`,
      [id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Get transaction items
    const [items] = await pool.query(
      `SELECT ti.*, p.product_name, ac.code as analytics_code, ac.description as analytics_description
       FROM transaction_items ti
       LEFT JOIN products p ON ti.product_id = p.product_id
       LEFT JOIN analytics_codes ac ON ti.analytics_code_id = ac.analytics_id
       WHERE ti.transaction_id = ?`,
      [id]
    );

    const transaction = transactions[0];
    transaction.items = items;

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
};

// ============================================================================
// UPDATE TRANSACTION
// PUT /api/transactions/:id
// ============================================================================
const updateTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { contact_id, transaction_date, due_date, items, notes, status } = req.body;

    const [existing] = await connection.query(
      'SELECT * FROM transactions WHERE transaction_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    await connection.beginTransaction();

    // Calculate new total if items provided
    let total_amount = existing[0].total_amount;
    
    if (items && items.length > 0) {
      total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Delete old items
      await connection.query('DELETE FROM transaction_items WHERE transaction_id = ?', [id]);

      // Insert new items
      for (const item of items) {
        await connection.query(
          `INSERT INTO transaction_items 
           (transaction_id, product_id, analytics_code_id, description, quantity, unit_price, amount) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.product_id || null,
            item.analytics_code_id,
            item.description,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price
          ]
        );
      }
    }

    // Update transaction
    await connection.query(
      `UPDATE transactions 
       SET contact_id = ?, transaction_date = ?, due_date = ?, total_amount = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE transaction_id = ?`,
      [contact_id, transaction_date, due_date, total_amount, notes || null, status || 'pending', id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// APPROVE TRANSACTION
// POST /api/transactions/:id/approve
// ============================================================================
const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM transactions WHERE transaction_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (existing[0].status === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Transaction is already approved'
      });
    }

    await pool.query(
      'UPDATE transactions SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Transaction approved successfully'
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve transaction'
    });
  }
};

// ============================================================================
// DELETE TRANSACTION
// DELETE /api/transactions/:id
// ============================================================================
const deleteTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    const [existing] = await connection.query(
      'SELECT transaction_id FROM transactions WHERE transaction_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    await connection.beginTransaction();

    // Delete transaction items first (foreign key constraint)
    await connection.query('DELETE FROM transaction_items WHERE transaction_id = ?', [id]);
    
    // Delete transaction
    await connection.query('DELETE FROM transactions WHERE transaction_id = ?', [id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  approveTransaction,
  deleteTransaction
};
