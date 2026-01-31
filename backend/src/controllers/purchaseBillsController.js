const { pool } = require('../../config/database');

// Get all purchase bills
exports.getPurchaseBills = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let query = `
            SELECT pb.*, c.name as customer_name 
            FROM purchase_bills pb 
            LEFT JOIN contacts c ON pb.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND pb.status = ?';
            params.push(status);
        }
        
        if (search) {
            query += ' AND (pb.bill_number LIKE ? OR c.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY pb.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching purchase bills:', error);
        res.status(500).json({ success: false, message: 'Error fetching purchase bills' });
    }
};

// Get single purchase bill by ID
exports.getPurchaseBillById = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT pb.*, c.name as customer_name 
             FROM purchase_bills pb 
             LEFT JOIN contacts c ON pb.customer_id = c.id
             WHERE pb.id = ?`,
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase bill not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching purchase bill:', error);
        res.status(500).json({ success: false, message: 'Error fetching purchase bill' });
    }
};

// Create new purchase bill
exports.createPurchaseBill = async (req, res) => {
    try {
        console.log('Creating purchase bill with data:', req.body);
        const { customer_id, bill_date, due_date, status, payment_status, notes, total_amount, items } = req.body;
        
        // Generate bill number
        const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM purchase_bills');
        const billNumber = `BILL-${String(countResult[0].count + 1).padStart(5, '0')}`;
        
        console.log('Generated bill number:', billNumber);
        console.log('Values:', [billNumber, customer_id, bill_date, due_date, status, payment_status, notes, total_amount]);
        
        const [result] = await pool.execute(
            `INSERT INTO purchase_bills (bill_number, vendor_id, customer_id, bill_date, due_date, status, payment_status, notes, total_amount) 
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
            [billNumber, customer_id, bill_date, due_date || null, status || 'draft', payment_status || 'not_paid', notes || null, total_amount || 0]
        );
        
        console.log('Insert result:', result);
        
        res.status(201).json({ 
            success: true, 
            message: 'Purchase bill created successfully',
            data: { id: result.insertId, bill_number: billNumber }
        });
    } catch (error) {
        console.error('Error creating purchase bill:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Error creating purchase bill: ' + error.message });
    }
};

// Update purchase bill
exports.updatePurchaseBill = async (req, res) => {
    try {
        const { customer_id, bill_date, due_date, status, payment_status, notes, total_amount } = req.body;
        
        const [result] = await pool.execute(
            `UPDATE purchase_bills SET 
                customer_id = ?,
                bill_date = ?, 
                due_date = ?, 
                status = ?, 
                payment_status = ?, 
                notes = ?, 
                total_amount = ?,
                updated_at = NOW()
             WHERE id = ?`,
            [customer_id, bill_date, due_date || null, status, payment_status, notes || null, total_amount || 0, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Purchase bill not found' });
        }
        
        res.json({ success: true, message: 'Purchase bill updated successfully' });
    } catch (error) {
        console.error('Error updating purchase bill:', error);
        res.status(500).json({ success: false, message: 'Error updating purchase bill' });
    }
};

// Delete purchase bill
exports.deletePurchaseBill = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM purchase_bills WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Purchase bill not found' });
        }
        
        res.json({ success: true, message: 'Purchase bill deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase bill:', error);
        res.status(500).json({ success: false, message: 'Error deleting purchase bill' });
    }
};
