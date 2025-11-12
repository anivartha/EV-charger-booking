/**
 * Booking API Routes (Simplified)
 * Alternative booking endpoints for UI compatibility
 */
import express from 'express';
import { BookingModel } from '../models/Booking';
import { createBooking } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// GET /api/bookings_api - Get bookings (optionally filtered by user_id)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id as string | undefined;
    
    if (userId) {
      // Get bookings for specific user
      const bookings = await BookingModel.findByUser(userId);
      res.json(bookings);
    } else {
      // If no user_id, require authentication and return current user's bookings
      // Note: This route should ideally require authentication
      res.status(400).json({ error: 'user_id query parameter is required' });
    }
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// POST /api/bookings_api - Create booking (requires authentication)
// This uses the same controller as /api/bookings
router.post('/', authenticate, createBooking);

export default router;
