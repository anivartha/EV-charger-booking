/**
 * Slot Model
 * Handles slot-related database operations
 */
import { query } from '../config/database';

export interface Slot {
  slot_id: number;
  charger_id: number;
  slot_date: string; // DATE
  slot_time: string; // TIME
  is_booked: boolean;
}

export class SlotModel {
  /**
   * Generate slots for a charger on a given date
   */
  static async generateSlots(chargerId: number, slotDate: string): Promise<void> {
    await query('SELECT generate_slots($1, $2::DATE)', [chargerId, slotDate]);
  }

  /**
   * Find available slots for a charger on a date
   */
  static async findAvailable(
    chargerId: number,
    slotDate: string
  ): Promise<Slot[]> {
    const result = await query(
      `SELECT * FROM slots
       WHERE charger_id = $1
         AND slot_date = $2::DATE
         AND is_booked = FALSE
       ORDER BY slot_time`,
      [chargerId, slotDate]
    );

    return result.rows;
  }

  /**
   * Find all slots for a charger on a date
   */
  static async findByChargerAndDate(
    chargerId: number,
    slotDate: string
  ): Promise<Slot[]> {
    const result = await query(
      `SELECT * FROM slots
       WHERE charger_id = $1
         AND slot_date = $2::DATE
       ORDER BY slot_time`,
      [chargerId, slotDate]
    );

    return result.rows;
  }
}

