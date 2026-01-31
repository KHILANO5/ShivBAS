const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../../config/database');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', invoice_id, invoice_type, customer_name, customer_email, customer_phone, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // Create order in Razorpay
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: currency,
            receipt: `receipt_${invoice_type}_${invoice_id}_${Date.now()}`,
            notes: {
                invoice_id: invoice_id,
                invoice_type: invoice_type,
                customer_name: customer_name
            }
        };

        const order = await razorpay.orders.create(options);

        // Save order to database
        await db.execute(
            `INSERT INTO razorpay_orders (order_id, invoice_id, invoice_type, amount, currency, status, customer_name, customer_email, customer_phone, description, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [order.id, invoice_id, invoice_type, amount, currency, 'created', customer_name || null, customer_email || null, customer_phone || null, description || null]
        );

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id, invoice_type } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update order status in database
            await db.execute(
                `UPDATE razorpay_orders SET payment_id = ?, signature = ?, status = 'paid', paid_at = NOW() WHERE order_id = ?`,
                [razorpay_payment_id, razorpay_signature, razorpay_order_id]
            );

            // Update invoice/bill status based on type
            if (invoice_type === 'invoice') {
                await db.execute(
                    `UPDATE invoices SET payment_status = 'paid', status = 'paid' WHERE id = ?`,
                    [invoice_id]
                );
            } else if (invoice_type === 'purchase_bill') {
                await db.execute(
                    `UPDATE purchase_bills SET payment_status = 'paid', status = 'posted' WHERE id = ?`,
                    [invoice_id]
                );
            } else if (invoice_type === 'purchase_order') {
                await db.execute(
                    `UPDATE purchase_orders SET status = 'received' WHERE id = ?`,
                    [invoice_id]
                );
            }

            // Create payment record
            await db.execute(
                `INSERT INTO payment_transactions (order_id, payment_id, invoice_id, invoice_type, amount, status, payment_method, created_at)
                 SELECT order_id, ?, invoice_id, invoice_type, amount, 'success', 'razorpay', NOW() 
                 FROM razorpay_orders WHERE order_id = ?`,
                [razorpay_payment_id, razorpay_order_id]
            );

            res.json({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id
            });
        } else {
            // Update order status as failed
            await db.execute(
                `UPDATE razorpay_orders SET status = 'failed' WHERE order_id = ?`,
                [razorpay_order_id]
            );

            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Payment verification error', error: error.message });
    }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { order_id } = req.params;

        const [rows] = await db.execute(
            `SELECT * FROM razorpay_orders WHERE order_id = ?`,
            [order_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ success: false, message: 'Error fetching payment status' });
    }
};

// Get All Payments
exports.getAllPayments = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT ro.*, pt.payment_method 
             FROM razorpay_orders ro 
             LEFT JOIN payment_transactions pt ON ro.order_id = pt.order_id 
             ORDER BY ro.created_at DESC`
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};

// Get Razorpay Key (for frontend)
exports.getKey = async (req, res) => {
    res.json({
        success: true,
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'
    });
};
