/**
 * Run Database Schema
 * Executes the schema.sql file to create all tables
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

async function runSchema() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Executing schema...');
    await client.query(schemaSQL);
    
    console.log('✅ Schema executed successfully!');
    console.log('✅ All tables created.');
    
    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Created tables (${tables.rows.length}):`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Some tables already exist (this is OK)');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema().catch(console.error);

