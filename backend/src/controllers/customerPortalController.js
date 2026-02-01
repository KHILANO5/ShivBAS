// ============================================================================
// Customer Portal Controller
// Located: backend/src/controllers/customerPortalController.js
// Handles: Customer-specific data access for portal users
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// GET CUSTOMER DASHBOARD
// GET /api/customer-portal/dashboard
// ============================================================================
const getDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get user's contact_id (customers are linked to contacts)
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.json({
                success: true,
                data: {
                    totalInvoices: 0,
                    pendingAmount: 0,
                    paidAmount: 0,
                    totalOrders: 0,
                    recentInvoices: [],
                    recentOrders: []
                }
            });
        }

        // Get invoice stats
        const [invoiceStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_invoices,
                COALESCE(SUM(CASE WHEN payment_status = 'not_paid' OR payment_status = 'partial' THEN total_amount ELSE 0 END), 0) as pending_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount
            FROM customer_invoices 
            WHERE customer_id = ?
        `, [contactId]);

        // Get order count
        const [orderStats] = await pool.query(
            'SELECT COUNT(*) as total_orders FROM sale_orders WHERE customer_id = ?',
            [contactId]
        );

        // Get recent invoices
        const [recentInvoices] = await pool.query(`
            SELECT id, total_amount, status, payment_status, created_at
            FROM customer_invoices 
            WHERE customer_id = ?
            ORDER BY created_at DESC 
            LIMIT 5
        `, [contactId]);

        // Get recent orders
        const [recentOrders] = await pool.query(`
            SELECT id, order_number, total_amount, status, created_at
            FROM sale_orders 
            WHERE customer_id = ?
            ORDER BY created_at DESC 
            LIMIT 5
        `, [contactId]);

        res.json({
            success: true,
            data: {
                totalInvoices: invoiceStats[0].total_invoices || 0,
                pendingAmount: parseFloat(invoiceStats[0].pending_amount) || 0,
                paidAmount: parseFloat(invoiceStats[0].paid_amount) || 0,
                totalOrders: orderStats[0].total_orders || 0,
                recentInvoices,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Customer dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
};

// ============================================================================
// GET CUSTOMER INVOICES
// GET /api/customer-portal/invoices
// ============================================================================
const getInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, payment_status } = req.query;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.json({ success: true, data: [] });
        }

        let query = `
            SELECT ci.*, c.name as customer_name
            FROM customer_invoices ci
            LEFT JOIN contacts c ON ci.customer_id = c.id
            WHERE ci.customer_id = ?
        `;
        const params = [contactId];

        if (status && status !== 'all') {
            query += ' AND ci.status = ?';
            params.push(status);
        }

        if (payment_status && payment_status !== 'all') {
            query += ' AND ci.payment_status = ?';
            params.push(payment_status);
        }

        query += ' ORDER BY ci.created_at DESC';

        const [invoices] = await pool.query(query, params);
        
        res.json({ success: true, data: invoices });
    } catch (error) {
        console.error('Get customer invoices error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
    }
};

// ============================================================================
// GET SINGLE INVOICE
// GET /api/customer-portal/invoices/:id
// ============================================================================
const getInvoiceById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        // Get invoice (only if it belongs to this customer)
        const [invoices] = await pool.query(`
            SELECT ci.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
            FROM customer_invoices ci
            LEFT JOIN contacts c ON ci.customer_id = c.id
            WHERE ci.id = ? AND ci.customer_id = ?
        `, [id, contactId]);

        if (invoices.length === 0) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        // Get invoice line items
        const [items] = await pool.query(`
            SELECT ili.*, p.name as product_name
            FROM invoice_line_items ili
            LEFT JOIN products p ON ili.product_id = p.id
            WHERE ili.invoice_id = ?
        `, [id]);

        const invoice = invoices[0];
        invoice.items = items;

        res.json({ success: true, data: invoice });
    } catch (error) {
        console.error('Get invoice by ID error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
    }
};

// ============================================================================
// GET CUSTOMER SALE ORDERS
// GET /api/customer-portal/sale-orders
// ============================================================================
const getSaleOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.json({ success: true, data: [] });
        }

        let query = `
            SELECT so.*, c.name as customer_name
            FROM sale_orders so
            LEFT JOIN contacts c ON so.customer_id = c.id
            WHERE so.customer_id = ?
        `;
        const params = [contactId];

        if (status && status !== 'all') {
            query += ' AND so.status = ?';
            params.push(status);
        }

        query += ' ORDER BY so.created_at DESC';

        const [orders] = await pool.query(query, params);
        
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get customer sale orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sale orders' });
    }
};

// ============================================================================
// GET SINGLE SALE ORDER
// GET /api/customer-portal/sale-orders/:id
// ============================================================================
const getSaleOrderById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Get order (only if it belongs to this customer)
        const [orders] = await pool.query(`
            SELECT so.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
            FROM sale_orders so
            LEFT JOIN contacts c ON so.customer_id = c.id
            WHERE so.id = ? AND so.customer_id = ?
        `, [id, contactId]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Get order line items
        const [items] = await pool.query(`
            SELECT soi.*, p.name as product_name
            FROM sale_order_items soi
            LEFT JOIN products p ON soi.product_id = p.id
            WHERE soi.sale_order_id = ?
        `, [id]);

        const order = orders[0];
        order.items = items;

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Get sale order by ID error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
};

// ============================================================================
// GET CUSTOMER PURCHASE ORDERS
// GET /api/customer-portal/purchase-orders
// ============================================================================
const getPurchaseOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.json({ success: true, data: [] });
        }

        let query = `
            SELECT po.*, c.name as vendor_name
            FROM purchase_orders po
            LEFT JOIN contacts c ON po.vendor_id = c.id
            WHERE po.vendor_id = ?
        `;
        const params = [contactId];

        if (status && status !== 'all') {
            query += ' AND po.status = ?';
            params.push(status);
        }

        query += ' ORDER BY po.created_at DESC';

        const [orders] = await pool.query(query, params);
        
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get customer purchase orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch purchase orders' });
    }
};

// ============================================================================
// GET CUSTOMER BILLS (Vendor Bills)
// GET /api/customer-portal/bills
// ============================================================================
const getBills = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, payment_status } = req.query;
        
        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;
        
        if (!contactId) {
            return res.json({ success: true, data: [] });
        }

        let query = `
            SELECT vb.*, c.name as vendor_name
            FROM vendor_bills vb
            LEFT JOIN contacts c ON vb.vendor_id = c.id
            WHERE vb.vendor_id = ?
        `;
        const params = [contactId];

        if (status && status !== 'all') {
            query += ' AND vb.status = ?';
            params.push(status);
        }

        if (payment_status && payment_status !== 'all') {
            query += ' AND vb.payment_status = ?';
            params.push(payment_status);
        }

        query += ' ORDER BY vb.created_at DESC';

        const [bills] = await pool.query(query, params);
        
        res.json({ success: true, data: bills });
    } catch (error) {
        console.error('Get customer bills error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bills' });
    }
};

// ============================================================================
// CREATE PAYMENT FOR INVOICE (Razorpay Integration)
// POST /api/customer-portal/pay-invoice
// ============================================================================
const createInvoicePayment = async (req, res) => {
    try {
        const Razorpay = require('razorpay');
        const { invoice_id } = req.body;
        const userId = req.user.userId;

        // Get user's contact_id
        const [userContact] = await pool.query(
            'SELECT id FROM contacts WHERE email = (SELECT email FROM users WHERE id = ?)',
            [userId]
        );
        
        const contactId = userContact.length > 0 ? userContact[0].id : null;

        // Get invoice and verify it belongs to this customer
        const [invoices] = await pool.query(
            'SELECT * FROM customer_invoices WHERE id = ? AND customer_id = ?',
            [invoice_id, contactId]
        );

        if (invoices.length === 0) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        const invoice = invoices[0];

        if (invoice.payment_status === 'paid') {
            return res.status(400).json({ success: false, error: 'Invoice is already paid' });
        }

        // Create Razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'yoursecrethere'
        });

        // Create Razorpay order
        const options = {
            amount: Math.round(parseFloat(invoice.total_amount) * 100), // Amount in paise
            currency: 'INR',
            receipt: `INV-${invoice.id}`,
            notes: {
                invoice_id: invoice.id,
                customer_id: contactId
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                invoice_id: invoice.id,
                key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere'
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, error: 'Failed to create payment' });
    }
};

// ============================================================================
// VERIFY PAYMENT
// POST /api/customer-portal/verify-payment
// ============================================================================
const verifyPayment = async (req, res) => {
    try {
        const crypto = require('crypto');
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'yoursecrethere')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }

        // Update invoice payment status
        await pool.query(
            'UPDATE customer_invoices SET payment_status = ?, updated_at = NOW() WHERE id = ?',
            ['paid', invoice_id]
        );

        // Record payment
        await pool.query(
            `INSERT INTO payments (invoice_id, amount_paid, payment_mode, transaction_id, payment_date, status)
             VALUES (?, (SELECT total_amount FROM customer_invoices WHERE id = ?), 'gateway', ?, CURDATE(), 'completed')`,
            [invoice_id, invoice_id, razorpay_payment_id]
        );

        res.json({ success: true, message: 'Payment verified and recorded successfully' });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
};

module.exports = {
    getDashboard,
    getInvoices,
    getInvoiceById,
    getSaleOrders,
    getSaleOrderById,
    getPurchaseOrders,
    getBills,
    createInvoicePayment,
    verifyPayment
};
