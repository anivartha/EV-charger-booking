/**
 * Database Setup Script
 * Tests connection and creates database/schema if needed
 */
const { Pool } = require('pg');
require('dotenv').config();

const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default postgres database first
});

async function setupDatabase() {
  const client = await adminPool.connect();
  
  try {
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if database exists
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME || 'ev_charger_booking']
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`📦 Creating database: ${process.env.DB_NAME || 'ev_charger_booking'}`);
      await client.query(
        `CREATE DATABASE "${process.env.DB_NAME || 'ev_charger_booking'}"`
      );
      console.log('✅ Database created');
    } else {
      console.log('✅ Database already exists');
    }
    
    // Now connect to the actual database
    client.release();
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ev_charger_booking',
    });
    
    const appClient = await appPool.connect();
    
    // Check if tables exist
    const tablesCheck = await appClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'booths', 'chargers', 'bookings')
    `);
    
    if (tablesCheck.rows.length === 0) {
      console.log('📋 Tables not found. Please run the schema.sql file manually.');
      console.log('   You can do this by:');
      console.log('   1. Opening pgAdmin or another PostgreSQL client');
      console.log('   2. Connecting to your database');
      console.log('   3. Running the SQL from src/db/schema.sql');
    } else {
      console.log(`✅ Found ${tablesCheck.rows.length} tables in database`);
    }
    
    appClient.release();
    await appPool.end();
    
    console.log('\n✅ Database setup complete!');
    console.log('You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '28P01') {
      console.error('\n🔐 Authentication failed!');
      console.error('Please check your .env file and update:');
      console.error('  DB_USER=postgres');
      console.error('  DB_PASSWORD=your_actual_postgres_password');
      console.error('\nTo find or reset your PostgreSQL password:');
      console.error('1. Open pgAdmin');
      console.error('2. Or check your PostgreSQL installation settings');
    }
  } finally {
    await adminPool.end();
  }
}

setupDatabase();

