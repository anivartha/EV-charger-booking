/**
 * Slot Controller
 */
import { Request, Response } from 'express';
import { SlotModel } from '../models/Slot';

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { charger_id, slot_date } = req.query;

    if (!charger_id || !slot_date) {
      res.status(400).json({ error: 'Charger ID and slot date are required' });
      return;
    }

    // Generate slots if they don't exist
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

