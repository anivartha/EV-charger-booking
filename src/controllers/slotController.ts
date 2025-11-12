/**
 * Slot Controller
 */
import { Request, Response } from 'express';
import { SlotModel } from '../models/Slot';
import { query } from '../config/database';

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { charger_id, slot_date } = req.query;

    if (!charger_id || !slot_date) {
      res.status(400).json({ error: 'Charger ID and slot date are required' });
      return;
    }

    // Validate date is within 3-day range (today + next 2 days)
    const requestedDate = new Date(slot_date as string);
    requestedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 2); // Today + 2 days = 3 days total

    if (requestedDate < today || requestedDate > maxDate) {
      res.status(400).json({ 
        error: 'Slots can only be viewed for the next 3 days (today and next 2 days)',
        allowed_range: {
          from: today.toISOString().split('T')[0],
          to: maxDate.toISOString().split('T')[0]
        }
      });
      return;
    }

    // Generate slots if they don't exist (only for valid dates)
    await SlotModel.generateSlots(
      parseInt(charger_id as string),
      slot_date as string
    );

    // Get available slots
    const availableSlots = await SlotModel.findAvailable(
      parseInt(charger_id as string),
      slot_date as string
    );

    // Get all slots (for display)
    const allSlots = await SlotModel.findByChargerAndDate(
      parseInt(charger_id as string),
      slot_date as string
    );

    res.json({
      available: availableSlots,
      all: allSlots
    });
  } catch (error: any) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots', details: error.message });
  }
};

/**
 * Get slots by path parameters: /slots/:chargerId/:date
 * Matches the pattern provided by user
 */
export const getSlotsByParams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chargerId, date } = req.params;

    if (!chargerId || !date) {
      res.status(400).json({ error: 'Charger ID and date are required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requested = new Date(date);
    requested.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((requested.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Restrict booking window
    if (diffDays > 3 || diffDays < 0) {
      res.status(400).json({ 
        message: 'Bookings are allowed only for the next 3 days.' 
      });
      return;
    }

    // Auto-generate slots if missing
    const existingSlots = await query(
      'SELECT * FROM slots WHERE charger_id = $1 AND slot_date = $2',
      [chargerId, date]
    );

    if (existingSlots.rows.length === 0) {
      await query('SELECT generate_slots($1, $2::DATE)', [chargerId, date]);
    }

    // Get updated slots
    const updatedSlots = await query(
      'SELECT * FROM slots WHERE charger_id = $1 AND slot_date = $2 ORDER BY slot_time',
      [chargerId, date]
    );

    res.json(updatedSlots.rows);
  } catch (error: any) {
    console.error('Get slots by params error:', error);
    res.status(500).json({ error: 'Failed to fetch slots', details: error.message });
  }
};

