/**
 * Create test users for login testing
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ev_charger_booking',
});

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating test users...');
    
    // Create admin user
    await client.query(`
      INSERT INTO users (username, password, password_hash, role, email, full_name)
      VALUES ('admin', 'admin123', 'dummy_hash', 'admin', 'admin@example.com', 'Admin User')
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `);
    
    // Create regular user
    await client.query(`
      INSERT INTO users (username, password, password_hash, role, email, full_name)
      VALUES ('user1', 'user123', 'dummy_hash', 'user', 'user1@example.com', 'Test User')
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `);
    
    console.log('✅ Test users created:');
    console.log('   Admin: username=admin, role=admin');
    console.log('   User:  username=user1, role=user');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUsers();

