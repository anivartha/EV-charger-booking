const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ev_charger_booking',
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Existing tables:', result.rows.map(r => r.table_name).join(', '));
    
    const chargers = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'chargers'
      ORDER BY ordinal_position
    `);
    console.log('\nChargers table columns:');
    chargers.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();

