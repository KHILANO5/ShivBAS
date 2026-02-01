const mysql = require('mysql2/promise');

(async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'shivbas_db'
    });
    
    const [fks] = await pool.query(
        "SELECT COLUMN_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'payments' AND TABLE_SCHEMA = 'shivbas_db' AND REFERENCED_TABLE_NAME IS NOT NULL"
    );
    
    console.log('Foreign keys in payments table:');
    fks.forEach(fk => console.log('  ' + fk.COLUMN_NAME + ' -> ' + fk.REFERENCED_TABLE_NAME));
    
    process.exit(0);
})();
