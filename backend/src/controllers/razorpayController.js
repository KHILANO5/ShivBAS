const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../../config/database');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// ============================================================================
// HELPER: Calculate Invoice Balance
// ============================================================================
const calculateInvoiceBalance = async (invoice_id, invoice_type) => {
    let totalAmount = 0;
    let totalPaid = 0;

    if (invoice_type === 'invoice' || invoice_type === 'customer_invoice') {
        // Get invoice total
        const [invoices] = await pool.execute(
            'SELECT total_amount FROM customer_invoices WHERE id = ?',
            [invoice_id]
        );
        if (invoices.length > 0) {
            totalAmount = parseFloat(invoices[0].total_amount) || 0;
        }

        // Get total paid for this invoice
        const [payments] = await pool.execute(
            'SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payments WHERE invoice_id = ? AND status = "completed"',
            [invoice_id]
        );
        totalPaid = parseFloat(payments[0].total_paid) || 0;
    } else if (invoice_type === 'purchase_bill' || invoice_type === 'bill') {
        // Get bill total
        const [bills] = await pool.execute(
            'SELECT total_amount FROM purchase_bills WHERE id = ?',
            [invoice_id]
        );
        if (bills.length > 0) {
            totalAmount = parseFloat(bills[0].total_amount) || 0;
        }

        // Get total paid for this bill
        const [payments] = await pool.execute(
            'SELECT COALESCE(SUM(amount_paid), 0) as total_paid FROM payments WHERE bill_id = ? AND status = "completed"',
            [invoice_id]
        );
        totalPaid = parseFloat(payments[0].total_paid) || 0;
    }

    const balance = totalAmount - totalPaid;
    return {
        total_amount: totalAmount,
        total_paid: totalPaid,
        balance: balance > 0 ? balance : 0,
        is_fully_paid: balance <= 0
    };
};

// ============================================================================
// HELPER: Update Payment Status
// ============================================================================
const updatePaymentStatus = async (invoice_id, invoice_type) => {
    const balanceInfo = await calculateInvoiceBalance(invoice_id, invoice_type);
    
    if (invoice_type === 'invoice' || invoice_type === 'customer_invoice') {
        // customer_invoices uses: not_paid, partial, paid
        let newStatus = 'not_paid';
        if (balanceInfo.is_fully_paid) {
            newStatus = 'paid';
        } else if (balanceInfo.total_paid > 0) {
            newStatus = 'partial';
        }
        
        await pool.execute(
            'UPDATE customer_invoices SET payment_status = ?, updated_at = NOW() WHERE id = ?',
            [newStatus, invoice_id]
        );
        
        return { ...balanceInfo, payment_status: newStatus };
    } else if (invoice_type === 'purchase_bill' || invoice_type === 'bill') {
        // purchase_bills uses: not_paid, partial_paid, paid
        let newStatus = 'not_paid';
        if (balanceInfo.is_fully_paid) {
            newStatus = 'paid';
        } else if (balanceInfo.total_paid > 0) {
            newStatus = 'partial_paid';
        }
        
        await pool.execute(
            'UPDATE purchase_bills SET payment_status = ?, updated_at = NOW() WHERE id = ?',
            [newStatus, invoice_id]
        );
        
        return { ...balanceInfo, payment_status: newStatus };
    }

    return balanceInfo;
};

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', invoice_id, invoice_type, customer_name, customer_email, customer_phone, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // Calculate current balance before creating order
        let balanceInfo = null;
        if (invoice_id && invoice_type) {
            balanceInfo = await calculateInvoiceBalance(invoice_id, invoice_type);
            
            // Check if payment amount exceeds balance
            if (amount > balanceInfo.balance) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Payment amount (₹${amount}) exceeds remaining balance (₹${balanceInfo.balance.toFixed(2)})`,
                    balance: balanceInfo
                });
            }
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
        await pool.execute(
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
            balance: balanceInfo,
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
            // Get order details to know the amount
            const [orderRows] = await pool.execute(
                'SELECT amount FROM razorpay_orders WHERE order_id = ?',
                [razorpay_order_id]
            );

            const paymentAmount = orderRows.length > 0 ? parseFloat(orderRows[0].amount) : 0;

            // Update order status in database
            await pool.execute(
                `UPDATE razorpay_orders SET payment_id = ?, signature = ?, status = 'paid', paid_at = NOW() WHERE order_id = ?`,
                [razorpay_payment_id, razorpay_signature, razorpay_order_id]
            );

            // Record payment in payments table with proper math
            if (invoice_type === 'invoice' || invoice_type === 'customer_invoice') {
                await pool.execute(
                    `INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, status, payment_date, created_at) 
                     VALUES (?, NULL, ?, 'gateway', ?, 'completed', CURDATE(), NOW())`,
                    [invoice_id, paymentAmount, razorpay_payment_id]
                );
            } else if (invoice_type === 'purchase_bill' || invoice_type === 'bill') {
                await pool.execute(
                    `INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, status, payment_date, created_at) 
                     VALUES (NULL, ?, ?, 'gateway', ?, 'completed', CURDATE(), NOW())`,
                    [invoice_id, paymentAmount, razorpay_payment_id]
                );
            }

            // Update payment status based on actual balance calculation
            const updatedBalance = await updatePaymentStatus(invoice_id, invoice_type);

            // Create payment transaction record (for tracking)
            try {
                await pool.execute(
                    `INSERT INTO payment_transactions (order_id, payment_id, invoice_id, invoice_type, amount, status, payment_method, created_at)
                     VALUES (?, ?, ?, ?, ?, 'success', 'razorpay', NOW())`,
                    [razorpay_order_id, razorpay_payment_id, invoice_id, invoice_type, paymentAmount]
                );
            } catch (e) {
                // Table might not exist, continue
                console.log('payment_transactions table may not exist:', e.message);
            }

            res.json({
                success: true,
                message: 'Payment verified successfully',
                payment_id: razorpay_payment_id,
                amount_paid: paymentAmount,
                balance: updatedBalance
            });
        } else {
            // Update order status as failed
            await pool.execute(
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

// Get Invoice Balance
exports.getInvoiceBalance = async (req, res) => {
    try {
        const { invoice_id, invoice_type } = req.params;
        
        const balanceInfo = await calculateInvoiceBalance(invoice_id, invoice_type);
        
        // Get payment history
        let payments = [];
        if (invoice_type === 'invoice' || invoice_type === 'customer_invoice') {
            const [rows] = await pool.execute(
                'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC',
                [invoice_id]
            );
            payments = rows;
        } else {
            const [rows] = await pool.execute(
                'SELECT * FROM payments WHERE bill_id = ? ORDER BY payment_date DESC',
                [invoice_id]
            );
            payments = rows;
        }

        res.json({
            success: true,
            data: {
                ...balanceInfo,
                payment_history: payments
            }
        });
    } catch (error) {
        console.error('Error fetching invoice balance:', error);
        res.status(500).json({ success: false, message: 'Error fetching balance' });
    }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { order_id } = req.params;

        const [rows] = await pool.execute(
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
        const [rows] = await pool.execute(
            `SELECT ro.*, 
                    CASE 
                        WHEN ro.invoice_type IN ('invoice', 'customer_invoice') THEN ci.total_amount
                        ELSE pb.total_amount 
                    END as invoice_total,
                    CASE 
                        WHEN ro.invoice_type IN ('invoice', 'customer_invoice') THEN ci.payment_status
                        ELSE pb.payment_status 
                    END as current_payment_status
             FROM razorpay_orders ro 
             LEFT JOIN customer_invoices ci ON ro.invoice_id = ci.id AND ro.invoice_type IN ('invoice', 'customer_invoice')
             LEFT JOIN purchase_bills pb ON ro.invoice_id = pb.id AND ro.invoice_type IN ('purchase_bill', 'bill')
             ORDER BY ro.created_at DESC`
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
};

// ============================================================================
// DIRECT PAYMENT (Simulated - for demo without actual Razorpay)
// POST /api/razorpay/direct-payment
// ============================================================================
exports.directPayment = async (req, res) => {
    try {
        const { amount, invoice_id, invoice_type, payment_mode = 'gateway' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        if (!invoice_id || !invoice_type) {
            return res.status(400).json({ success: false, message: 'Invoice ID and type are required' });
        }

        // Calculate current balance before payment
        const balanceInfo = await calculateInvoiceBalance(invoice_id, invoice_type);

        // Check if payment amount exceeds balance
        if (amount > balanceInfo.balance) {
            return res.status(400).json({
                success: false,
                message: `Payment amount (₹${amount}) exceeds remaining balance (₹${balanceInfo.balance.toFixed(2)})`,
                balance: balanceInfo
            });
        }

        // Generate a transaction ID
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Record payment in payments table
        if (invoice_type === 'invoice' || invoice_type === 'customer_invoice') {
            await pool.execute(
                `INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, status, payment_date, created_at) 
                 VALUES (?, NULL, ?, ?, ?, 'completed', CURDATE(), NOW())`,
                [invoice_id, amount, payment_mode, transactionId]
            );
        } else if (invoice_type === 'purchase_bill' || invoice_type === 'bill') {
            await pool.execute(
                `INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, status, payment_date, created_at) 
                 VALUES (NULL, ?, ?, ?, ?, 'completed', CURDATE(), NOW())`,
                [invoice_id, amount, payment_mode, transactionId]
            );
        }

        // Update payment status based on new balance
        const updatedBalance = await updatePaymentStatus(invoice_id, invoice_type);

        // Also record in razorpay_orders for tracking
        try {
            await pool.execute(
                `INSERT INTO razorpay_orders (order_id, invoice_id, invoice_type, amount, currency, status, payment_id, created_at, paid_at) 
                 VALUES (?, ?, ?, ?, 'INR', 'paid', ?, NOW(), NOW())`,
                [`order_${transactionId}`, invoice_id, invoice_type, amount, transactionId]
            );
        } catch (e) {
            // Table might not exist or have different schema, continue
            console.log('Could not record in razorpay_orders:', e.message);
        }

        res.json({
            success: true,
            message: 'Payment successful',
            data: {
                transaction_id: transactionId,
                amount_paid: amount,
                payment_mode: payment_mode
            },
            balance: updatedBalance
        });
    } catch (error) {
        console.error('Direct payment error:', error);
        res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
    }
};

// Get Razorpay Key (for frontend)
exports.getKey = async (req, res) => {
    res.json({
        success: true,
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'
    });
};
