/**
 * Application Entry Point
 * Initializes database connection and starts the Express server
 */
import app from './app';
import { initializeDatabase, testConnection, initializeSchema } from './config/database';

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');
    initializeDatabase();

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Initialize schema (verify tables exist)
    await initializeSchema();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

