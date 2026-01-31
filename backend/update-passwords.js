// Update user passwords in database with correct bcrypt hash
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shivbas_db'
  });

  try {
    console.log('\n===========================================');
    console.log('Updating User Passwords...');
    console.log('===========================================\n');
    
    const passwordHash = '$2a$10$pG8xqb8MG.uKgvEF4t01i.FXpnr/peGiDMZHqwxMeR06gTQvbKIKy';
    
    const [result] = await connection.execute(
      `UPDATE users SET password = ? WHERE login_id IN ('admin_user', 'john_portal', 'jane_portal', 'supplier_abc')`,
      [passwordHash]
    );
    
    console.log(`Updated ${result.affectedRows} users`);
    console.log('Password for all users is now: Test@123');
    console.log('\n===========================================\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

updatePasswords();
