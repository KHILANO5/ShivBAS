// Generate bcrypt hash for password "Test@123"
const bcrypt = require('bcryptjs');

const password = 'Test@123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n===========================================');
  console.log('Password Hash Generated!');
  console.log('===========================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n');
  console.log('SQL Update Query:');
  console.log(`UPDATE users SET password = '${hash}' WHERE login_id IN ('admin_user', 'john_portal', 'jane_portal', 'supplier_abc');`);
  console.log('\n===========================================\n');
});
