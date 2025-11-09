/**
 * Booking Routes
 * Handles booking-related endpoints
 */
import { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation middleware
const createBookingValidation = [
  body('charger_id').isUUID().withMessage('Valid charger ID is required'),
  body('booking_date').isISO8601().toDate().withMessage('Valid booking date is required'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Valid start time format (HH:MM:SS) is required'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Valid end time format (HH:MM:SS) is required'),
  handleValidationErrors
];

// All booking routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (User)
 */
router.post('/', createBookingValidation, createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private (User)
 */
router.get('/', getUserBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (User, Admin)
 */
router.get('/:id', getBookingById);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (User, Admin)
 */
router.put('/:id/cancel', cancelBooking);

export default router;

