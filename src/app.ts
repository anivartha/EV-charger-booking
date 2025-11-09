/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import stationRoutes from './routes/stationRoutes';
import bookingApiRoutes from './routes/bookingApiRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Serve static UI from /public (optional but recommended for demo)
app.use(express.static(path.join(__dirname, '../public')));

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Register API routes (after app is created)
app.use('/api/auth', authRoutes);

// Keep your existing bookingRoutes (main booking endpoints)
app.use('/api/bookings', bookingRoutes);

// Helper routes we added for UI — station list and a simpler bookings API
app.use('/api/stations', stationRoutes);
app.use('/api/bookings_api', bookingApiRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ev-charger-backend'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
