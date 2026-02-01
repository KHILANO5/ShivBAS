const mysql = require('mysql2/promise');

(async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'shivbas_db'
    });

    try {
        console.log('Adding sale orders for customer...');
        
        // Add sale orders for customer_id = 1 (John Doe)
        await pool.query(
            "INSERT INTO sale_orders (customer_id, order_number, order_date, total_amount, status, notes) VALUES (1, 'SO-00001', '2026-01-20', 3500.00, 'confirmed', 'First sale order')"
        );
        
        await pool.query(
            "INSERT INTO sale_orders (customer_id, order_number, order_date, total_amount, status, notes) VALUES (1, 'SO-00002', '2026-01-25', 2200.00, 'draft', 'Second sale order')"
        );
        
        console.log('Sale orders added!');
        
        // Verify data
        const [orders] = await pool.query('SELECT * FROM sale_orders WHERE customer_id = 1');
        console.log('Orders for customer:', orders);
        
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('Data already exists, skipping...');
        } else {
            console.error('Error:', err.message);
        }
    }
    
    process.exit(0);
})();
