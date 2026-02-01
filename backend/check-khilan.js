const mysql = require('mysql2/promise');

(async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'shivbas_db'
    });

    try {
        // Check khilan user
        const [users] = await pool.query("SELECT id, login_id, email, name, role FROM users WHERE login_id = 'khilanP'");
        console.log('Khilan user:', users);
        
        if (users.length > 0) {
            const userEmail = users[0].email;
            
            // Check if there's a matching contact
            const [contacts] = await pool.query("SELECT * FROM contacts WHERE email = ?", [userEmail]);
            console.log('\nMatching contact for email:', userEmail);
            console.log('Contact found:', contacts);
            
            // If no contact, show all contacts
            if (contacts.length === 0) {
                console.log('\nNo contact matches this email!');
                console.log('Customer portal links users to contacts via EMAIL match.');
                console.log('\nExisting contacts:');
                const [allContacts] = await pool.query("SELECT id, name, email, type FROM contacts");
                console.log(allContacts);
            }
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    }
    
    process.exit(0);
})();
