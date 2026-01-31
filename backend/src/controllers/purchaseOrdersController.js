// ============================================================================
// Purchase Orders Controller
// Located: backend/src/controllers/purchaseOrdersController.js
// ============================================================================

const { pool } = require('../../config/database');

// ============================================================================
// GET ALL PURCHASE ORDERS
// ============================================================================
const getPurchaseOrders = async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = `
            SELECT 
                po.*,
                c.name as vendor_name
            FROM purchase_orders po
            LEFT JOIN contacts c ON po.vendor_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            query += ' AND po.status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (po.po_number LIKE ? OR c.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY po.created_at DESC';

        const [orders] = await pool.query(query, params);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get purchase orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch purchase orders'
        });
    }
};

// ============================================================================
// GET PURCHASE ORDER BY ID
// ============================================================================
const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await pool.query(`
            SELECT 
                po.*,
                c.name as vendor_name
            FROM purchase_orders po
            LEFT JOIN contacts c ON po.vendor_id = c.id
            WHERE po.id = ?
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Purchase order not found'
            });
        }

        res.json({
            success: true,
            data: orders[0]
        });
    } catch (error) {
        console.error('Get purchase order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch purchase order'
        });
    }
};

// ============================================================================
// CREATE PURCHASE ORDER
// ============================================================================
const createPurchaseOrder = async (req, res) => {
    try {
        const { vendor_id, order_date, expected_date, total_amount, status, notes } = req.body;

        // Generate PO number
        const year = new Date().getFullYear();
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as count FROM purchase_orders WHERE YEAR(created_at) = ?',
            [year]
        );
        const poNumber = `PO-${year}-${String(countResult[0].count + 1).padStart(3, '0')}`;

        const [result] = await pool.query(
            `INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, total_amount, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [poNumber, vendor_id, order_date, expected_date || null, total_amount || 0, status || 'draft', notes || null]
        );

        const [newOrder] = await pool.query(
            `SELECT po.*, c.name as vendor_name
             FROM purchase_orders po
             LEFT JOIN contacts c ON po.vendor_id = c.id
             WHERE po.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data: newOrder[0]
        });
    } catch (error) {
        console.error('Create purchase order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create purchase order'
        });
    }
};

// ============================================================================
// UPDATE PURCHASE ORDER
// ============================================================================
const updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendor_id, order_date, expected_date, total_amount, status, notes } = req.body;

        await pool.query(
            `UPDATE purchase_orders 
             SET vendor_id = ?, order_date = ?, expected_date = ?, total_amount = ?, status = ?, notes = ?
             WHERE id = ?`,
            [vendor_id, order_date, expected_date || null, total_amount || 0, status, notes || null, id]
        );

        const [updatedOrder] = await pool.query(
            `SELECT po.*, c.name as vendor_name
             FROM purchase_orders po
             LEFT JOIN contacts c ON po.vendor_id = c.id
             WHERE po.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Purchase order updated successfully',
            data: updatedOrder[0]
        });
    } catch (error) {
        console.error('Update purchase order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update purchase order'
        });
    }
};

// ============================================================================
// DELETE PURCHASE ORDER
// ============================================================================
const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM purchase_orders WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Purchase order deleted successfully'
        });
    } catch (error) {
        console.error('Delete purchase order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete purchase order'
        });
    }
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
};
