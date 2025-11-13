/**
 * Booking Model (New Schema)
 * Handles booking-related database operations
 */
import { query } from '../config/database';

export interface BookingNew {
  booking_id: number;
  user_id: string;
  charger_id: number;
  slot_start: Date;
  slot_end: Date;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: Date;
}

export interface CreateBookingData {
  user_id: string;
  charger_id: number;
  slot_start: Date;
  slot_end: Date;
  amount: number;
}

export class BookingNewModel {
  /**
   * Create a new booking
   */
  static async create(bookingData: CreateBookingData): Promise<BookingNew> {
    const result = await query(
      `INSERT INTO bookings_new (user_id, charger_id, slot_start, slot_end, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        bookingData.user_id,
        bookingData.charger_id,
        bookingData.slot_start,
        bookingData.slot_end,
        bookingData.amount
      ]
    );

    return result.rows[0];
  }

  /**
   * Find bookings by user
   */
  static async findByUser(userId: string): Promise<BookingNew[]> {
    const result = await query(
      `SELECT b.*, c.charger_type, c.power_kw, s.station_name, s.location
       FROM bookings_new b
       JOIN chargers_new c ON b.charger_id = c.charger_id
       JOIN stations s ON c.station_id = s.station_id
       WHERE b.user_id = $1
       ORDER BY b.slot_start DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Find booking by ID
   */
  static async findById(id: number): Promise<BookingNew | null> {
    const result = await query(
      'SELECT * FROM bookings_new WHERE booking_id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all bookings (for admin)
   */
  static async findAll(): Promise<BookingNew[]> {
    const result = await query(
      `SELECT b.*, c.charger_type, c.power_kw, s.station_name
       FROM bookings_new b
       JOIN chargers_new c ON b.charger_id = c.charger_id
       JOIN stations s ON c.station_id = s.station_id
       ORDER BY b.slot_start DESC`
    );

    return result.rows;
  }
}

