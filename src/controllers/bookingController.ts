/**
 * Booking Controller
 * Handles booking-related operations
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BookingModel, CreateBookingData } from '../models/Booking';
import { ChargerModel } from '../models/Charger';
import { PaymentModel } from '../models/Payment';

export interface CreateBookingRequest extends AuthRequest {
  body: {
    charger_id: string;
    booking_date: string; // Format: YYYY-MM-DD
    start_time: string; // Format: HH:MM:SS
    end_time: string; // Format: HH:MM:SS
  };
}

/**
 * Create a new booking
 */
export const createBooking = async (
  req: CreateBookingRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { charger_id, booking_date, start_time, end_time } = req.body;

    // Validate input
    if (!charger_id || !booking_date || !start_time || !end_time) {
      res.status(400).json({
        error: 'charger_id, booking_date, start_time, and end_time are required'
      });
      return;
    }

    // Check if charger exists and is active
    const charger = await ChargerModel.findById(charger_id);
    if (!charger) {
      res.status(404).json({ error: 'Charger not found' });
      return;
    }

    if (!charger.is_active) {
      res.status(400).json({ error: 'Charger is not active' });
      return;
    }

    // Check if charger is available for the requested time slot
    const isAvailable = await ChargerModel.isAvailable(
      charger_id,
      booking_date,
      start_time,
      end_time
    );

    if (!isAvailable) {
      res.status(400).json({ error: 'Charger is not available for the selected time slot' });
      return;
    }

    // Calculate booking duration in hours
    const start = new Date(`${booking_date}T${start_time}`);
    const end = new Date(`${booking_date}T${end_time}`);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours <= 0) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    // Calculate total amount
    const total_amount = parseFloat((charger.price_per_hour * durationHours).toFixed(2));

    // Create booking
    const bookingData: CreateBookingData = {
      user_id: req.user.id,
      charger_id,
      booking_date,
      start_time,
      end_time,
      total_amount
    };

    const booking = await BookingModel.create(bookingData);

    // Create payment record (pending status)
    await PaymentModel.create({
      booking_id: booking.id,
      user_id: req.user.id,
      amount: total_amount,
      payment_method: 'credit_card' // This would come from the request in a real app
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    
    // Handle PostgreSQL constraint violations
    if (error.code === '23P01') {
      res.status(400).json({
        error: 'Booking time slot conflicts with an existing booking'
      });
      return;
    }

    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const bookings = await BookingModel.findByUser(req.user.id);

    res.json({
      bookings
    });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const booking = await BookingModel.findByIdWithDetails(id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if user owns this booking or is admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ booking });
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking', details: error.message });
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const booking = await BookingModel.findById(id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      res.status(400).json({ error: 'Booking is already cancelled' });
      return;
    }

    if (booking.status === 'completed') {
      res.status(400).json({ error: 'Cannot cancel completed booking' });
      return;
    }

    // Update booking status
    const updatedBooking = await BookingModel.updateStatus(id, 'cancelled');

    // Update payment status to refunded
    const payment = await PaymentModel.findByBooking(id);
    if (payment) {
      await PaymentModel.updateStatus(payment.id, 'refunded');
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
  }
};

