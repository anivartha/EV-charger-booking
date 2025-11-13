/**
 * Run full database migration with new schema
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
    console.log('🔄 Running full schema migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'full_schema.sql'),
      'utf8'
    );
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Created tables:');
    console.log('   - stations');
    console.log('   - chargers');
    console.log('   - slots');
    console.log('   - bookings_new');
    console.log('   - booking_logs');
    console.log('\n⚙️  Created functions:');
    console.log('   - generate_slots()');
    console.log('   - mark_slot_booked()');
    console.log('   - log_booking_changes()');
    console.log('   - update_station_revenue()');
    console.log('\n🔔 Created triggers:');
    console.log('   - trg_slot_booked');
    console.log('   - trg_booking_log');
    console.log('   - trg_revenue_update');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

