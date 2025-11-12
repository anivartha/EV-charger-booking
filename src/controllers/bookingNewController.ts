/**
 * Booking Controller (New Schema)
 */
import { Request, Response } from 'express';
import { BookingNewModel } from '../models/BookingNew';
import { ChargerNewModel } from '../models/ChargerNew';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, charger_id, slot_start, slot_end } = req.body;

    if (!user_id || !charger_id || !slot_start || !slot_end) {
      res.status(400).json({ error: 'User ID, charger ID, slot start, and slot end are required' });
      return;
    }

    // Check if charger exists
    const charger = await ChargerNewModel.findById(parseInt(charger_id));
    if (!charger) {
      res.status(404).json({ error: 'Charger not found' });
      return;
    }

    if (charger.status !== 'Available') {
      res.status(400).json({ error: 'Charger is not available' });
      return;
    }

    // Calculate amount (simple: 30 min = 50, 1 hour = 100, etc.)
    const start = new Date(slot_start);
    const end = new Date(slot_end);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const amount = Math.round(hours * 100 * 100) / 100; // ₹100 per hour

    // Create booking (triggers will fire automatically)
    const booking = await BookingNewModel.create({
      user_id,
      charger_id: parseInt(charger_id),
      slot_start: start,
      slot_end: end,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const bookings = await BookingNewModel.findByUser(user_id as string);

    res.json({ bookings });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
};

