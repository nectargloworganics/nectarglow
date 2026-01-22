// cart.js
const pool = require('./db');

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect(); // get a client from the pool
    console.log('✅ Connected to PostgreSQL successfully');
    client.release(); // release client back to pool
    process.exit(0); // exit after test
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
}

testConnection();
