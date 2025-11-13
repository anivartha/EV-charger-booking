/**
 * Run database migration to add username, password, role fields
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ev_charger_booking',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migration: add_user_fields.sql');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'add_user_fields.sql'),
      'utf8'
    );
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('username', 'password', 'role')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Updated users table columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'none'})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

