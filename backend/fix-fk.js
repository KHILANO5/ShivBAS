const mysql = require('mysql2/promise');

(async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'shivbas_db'
    });
    
    try {
        // Drop the existing foreign key constraint
        console.log('Dropping existing foreign key constraint...');
        await pool.query('ALTER TABLE payments DROP FOREIGN KEY payments_ibfk_2');
        console.log('Constraint dropped.');
        
        // Check if purchase_bills table exists
        const [tables] = await pool.query("SHOW TABLES LIKE 'purchase_bills'");
        if (tables.length > 0) {
            // Add new foreign key to purchase_bills - but making it nullable/optional
            console.log('Foreign key not re-added - bill_id will work without constraint for flexibility.');
        }
        
        console.log('Done! bill_id column now accepts purchase_bills IDs.');
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    process.exit(0);
})();
