// ============================================================================
// Payments Controller
// Located: backend/src/controllers/paymentsController.js
// Handles: Payment Recording and Tracking
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// RECORD PAYMENT
// POST /api/payments
// ============================================================================
const recordPayment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { invoice_id, bill_id, amount_paid, payment_date, payment_mode, transaction_id, notes } = req.body;

    if (!amount_paid || !payment_date || !payment_mode) {
      return res.status(400).json({
        success: false,
        error: 'Amount, payment date, and payment mode are required'
      });
    }

    if (!invoice_id && !bill_id) {
      return res.status(400).json({
        success: false,
        error: 'Either invoice_id or bill_id is required'
      });
    }

    await connection.beginTransaction();

    let total_amount = 0;
    let tableName = '';
    let idField = '';
    let idValue = 0;

    // Get transaction details
    if (invoice_id) {
      const [invoices] = await connection.query(
        'SELECT id, total_amount, payment_status FROM customer_invoices WHERE id = ?',
        [invoice_id]
      );
      
      if (invoices.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }
      
      total_amount = parseFloat(invoices[0].total_amount);
      tableName = 'customer_invoices';
      idField = 'id';
      idValue = invoice_id;
    } else {
      const [bills] = await connection.query(
        'SELECT id, total_amount, payment_status FROM vendor_bills WHERE id = ?',
        [bill_id]
      );
      
      if (bills.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Bill not found'
        });
      }
      
      total_amount = parseFloat(bills[0].total_amount);
      tableName = 'vendor_bills';
      idField = 'id';
      idValue = bill_id;
    }

    // Check total payments so far
    const [existingPayments] = await connection.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payments WHERE ${invoice_id ? 'invoice_id' : 'bill_id'} = ?`,
      [idValue]
    );

    const total_paid = parseFloat(existingPayments[0].total_paid) + parseFloat(amount_paid);

    if (total_paid > total_amount) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Payment amount exceeds transaction total'
      });
    }

    // Insert payment
    const [result] = await connection.query(
      `INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, payment_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
      [invoice_id || null, bill_id || null, amount_paid, payment_mode, transaction_id || null, payment_date]
    );

    // Update payment status
    const newPaymentStatus = total_paid >= total_amount ? 'paid' : 'partial';
    await connection.query(
      `UPDATE ${tableName} SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = ?`,
      [newPaymentStatus, idValue]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment_id: result.insertId,
        invoice_id: invoice_id || null,
        bill_id: bill_id || null,
        amount_paid,
        payment_date,
        total_paid,
        remaining: total_amount - total_paid,
        payment_status: newPaymentStatus
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment'
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// GET PAYMENT HISTORY
// GET /api/payments
// ============================================================================
const getPayments = async (req, res) => {
  try {
    const { start_date, end_date, payment_mode } = req.query;

    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];

    if (start_date) {
      query += ' AND payment_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND payment_date <= ?';
      params.push(end_date);
    }

    if (payment_mode) {
      query += ' AND payment_mode = ?';
      params.push(payment_mode);
    }

    query += ' ORDER BY payment_date DESC, created_at DESC';

    const [payments] = await pool.query(query, params);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
};

// ============================================================================
// GET INVOICE PAYMENTS (for specific transaction)
// GET /api/payments/transaction/:transaction_id
// ============================================================================
const getTransactionPayments = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    // Get transaction details
    const [transactions] = await pool.query(
      `SELECT t.*, c.contact_name 
       FROM transactions t
       LEFT JOIN contacts c ON t.contact_id = c.contact_id
       WHERE t.transaction_id = ?`,
      [transaction_id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Get all payments for this transaction
    const [payments] = await pool.query(
      `SELECT p.*, u.name as recorded_by_name
       FROM payments p
       LEFT JOIN users u ON p.recorded_by = u.user_id
       WHERE p.transaction_id = ?
       ORDER BY p.payment_date DESC`,
      [transaction_id]
    );

    // Calculate totals
    const total_paid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const transaction_total = parseFloat(transactions[0].total_amount);
    const remaining = transaction_total - total_paid;

    res.json({
      success: true,
      data: {
        transaction: transactions[0],
        payments,
        summary: {
          total_amount: transaction_total,
          total_paid,
          remaining,
          status: remaining <= 0 ? 'paid' : (total_paid > 0 ? 'partial' : 'pending')
        }
      }
    });
  } catch (error) {
    console.error('Get transaction payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction payments'
    });
  }
};

// ============================================================================
// GET SINGLE PAYMENT
// GET /api/payments/:id
// ============================================================================
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.query(
      `SELECT p.*, 
              CASE WHEN p.invoice_id IS NOT NULL THEN ci.total_amount ELSE vb.total_amount END as transaction_amount,
              CASE WHEN p.invoice_id IS NOT NULL THEN ci.payment_status ELSE vb.payment_status END as transaction_payment_status,
              CASE WHEN p.invoice_id IS NOT NULL THEN c1.name ELSE c2.name END as contact_name
       FROM payments p
       LEFT JOIN customer_invoices ci ON p.invoice_id = ci.id
       LEFT JOIN vendor_bills vb ON p.bill_id = vb.id
       LEFT JOIN contacts c1 ON ci.customer_id = c1.id
       LEFT JOIN contacts c2 ON vb.vendor_id = c2.id
       WHERE p.id = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payments[0]
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    });
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getPaymentById,
  getTransactionPayments
};
