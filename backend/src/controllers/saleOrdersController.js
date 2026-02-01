// ============================================================================
// Sale Orders Controller
// Located: backend/src/controllers/saleOrdersController.js
// Handles: CRUD operations for Sale Orders with line items
// ============================================================================

const { pool } = require('../../config/database');

// Get all sale orders
exports.getSaleOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let query = `
            SELECT so.*, c.name as customer_name 
            FROM sale_orders so 
            LEFT JOIN contacts c ON so.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND so.status = ?';
            params.push(status);
        }
        
        if (search) {
            query += ' AND (so.order_number LIKE ? OR c.name LIKE ? OR so.reference LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY so.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching sale orders:', error);
        res.status(500).json({ success: false, message: 'Error fetching sale orders' });
    }
};

// Get single sale order by ID with line items
exports.getSaleOrderById = async (req, res) => {
    try {
        const [orders] = await pool.execute(
            `SELECT so.*, c.name as customer_name 
             FROM sale_orders so 
             LEFT JOIN contacts c ON so.customer_id = c.id
             WHERE so.id = ?`,
            [req.params.id]
        );
        
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Sale order not found' });
        }
        
        // Get line items
        const [items] = await pool.execute(
            `SELECT soi.*, p.name as product_name_from_master
             FROM sale_order_items soi
             LEFT JOIN products p ON soi.product_id = p.id
             WHERE soi.sale_order_id = ?`,
            [req.params.id]
        );
        
        const order = orders[0];
        order.items = items;
        
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error fetching sale order:', error);
        res.status(500).json({ success: false, message: 'Error fetching sale order' });
    }
};

// Create new sale order with line items
exports.createSaleOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { customer_id, order_date, reference, status, notes, total_amount, items } = req.body;
        
        // Generate order number: SO00001, SO00002, etc.
        const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM sale_orders');
        const orderNumber = `SO${String(countResult[0].count + 1).padStart(5, '0')}`;
        
        // Insert sale order
        const [result] = await connection.execute(
            `INSERT INTO sale_orders (order_number, customer_id, order_date, reference, status, notes, total_amount) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderNumber, customer_id || null, order_date, reference || null, status || 'draft', notes || null, total_amount || 0]
        );
        
        const orderId = result.insertId;
        
        // Insert line items if provided
        if (items && items.length > 0) {
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO sale_order_items (sale_order_id, product_id, product_name, quantity, unit_price, tax_rate, amount)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, item.product_id || null, item.product_name || '', item.quantity || 1, item.unit_price || 0, item.tax_rate || 0, item.amount || 0]
                );
            }
        }
        
        await connection.commit();
        
        res.status(201).json({ 
            success: true, 
            message: 'Sale order created successfully',
            data: { id: orderId, order_number: orderNumber }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating sale order:', error);
        res.status(500).json({ success: false, message: 'Error creating sale order: ' + error.message });
    } finally {
        connection.release();
    }
};

// Update sale order
exports.updateSaleOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { customer_id, order_date, reference, status, notes, total_amount, items } = req.body;
        const orderId = req.params.id;
        
        // Update sale order
        const [result] = await connection.execute(
            `UPDATE sale_orders SET 
                customer_id = ?,
                order_date = ?, 
                reference = ?,
                status = ?, 
                notes = ?, 
                total_amount = ?,
                updated_at = NOW()
             WHERE id = ?`,
            [customer_id || null, order_date, reference || null, status, notes || null, total_amount || 0, orderId]
        );
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Sale order not found' });
        }
        
        // Delete existing line items and re-insert
        await connection.execute('DELETE FROM sale_order_items WHERE sale_order_id = ?', [orderId]);
        
        // Insert new line items
        if (items && items.length > 0) {
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO sale_order_items (sale_order_id, product_id, product_name, quantity, unit_price, tax_rate, amount)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, item.product_id || null, item.product_name || '', item.quantity || 1, item.unit_price || 0, item.tax_rate || 0, item.amount || 0]
                );
            }
        }
        
        await connection.commit();
        
        res.json({ success: true, message: 'Sale order updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating sale order:', error);
        res.status(500).json({ success: false, message: 'Error updating sale order' });
    } finally {
        connection.release();
    }
};

// Update sale order status only
exports.updateSaleOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        const [result] = await pool.execute(
            'UPDATE sale_orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, orderId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Sale order not found' });
        }
        
        res.json({ success: true, message: `Sale order ${status}` });
    } catch (error) {
        console.error('Error updating sale order status:', error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
};

// Delete sale order
exports.deleteSaleOrder = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM sale_orders WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Sale order not found' });
        }
        
        res.json({ success: true, message: 'Sale order deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale order:', error);
        res.status(500).json({ success: false, message: 'Error deleting sale order' });
    }
};
