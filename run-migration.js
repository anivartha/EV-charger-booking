/**
 * Database Migration Runner
 * Runs SQL migrations to update the database schema
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'qwerty',
  database: process.env.DB_NAME || 'ev_charger_booking',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running database migration...');
    
    const migrationFile = path.join(__dirname, 'src', 'db', 'migrations', 'add_username_password_role.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Changes made:');
    console.log('  - Added username column (unique)');
    console.log('  - Added password column');
    console.log('  - Added role column (admin/user) with default "user"');
    console.log('  - Created indexes for better performance');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some columns may already exist. This is okay.');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

