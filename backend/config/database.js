// ============================================================================
// Database Connection Configuration
// Located: backend/config/database.js
// ============================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'shivbas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Test database connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connection Successful');
    
    // Get database info
    const [rows] = await connection.query('SELECT DATABASE() as db');
    console.log(`📊 Connected to database: ${rows[0].db}`);
    
    // Get table count
    const [tables] = await connection.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    console.log(`📋 Tables in database: ${tables[0].table_count}`);
    
    connection.release();
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    console.error('Make sure MySQL is running and .env variables are correct');
    throw error;
  }
};

/**
 * Execute a query
 * @param {string} sql - SQL query
 * @param {array} values - Query parameters
 * @returns {Promise} Query result
 */
const query = async (sql, values = []) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(sql, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database Query Error:', error.message);
    throw error;
  }
};

/**
 * Execute a transaction
 * @param {function} callback - Function containing transaction queries
 * @returns {Promise} Transaction result
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Transaction Error:', error.message);
    throw error;
  }
};

/**
 * Close all connections
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  closePool,
  testConnection
};
