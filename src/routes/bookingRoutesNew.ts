/**
 * Booking Routes (New Schema)
 */
import { Router } from 'express';
import {
  createBooking,
  getUserBookings
} from '../controllers/bookingNewController';

const router = Router();

router.post('/', createBooking);
router.get('/', getUserBookings);

export default router;

