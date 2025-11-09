/**
 * Booking Model
 * Handles booking-related database operations
 */
import { query } from '../config/database';

export interface Booking {
  id: string;
  user_id: string;
  charger_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookingData {
  user_id: string;
  charger_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
}

export interface BookingWithDetails extends Booking {
  charger_name?: string;
  charger_type?: string;
  booth_name?: string;
  user_name?: string;
}

export class BookingModel {
  /**
   * Create a new booking
   */
  static async create(bookingData: CreateBookingData): Promise<Booking> {
    const result = await query(
      `INSERT INTO bookings (user_id, charger_id, booking_date, start_time, end_time, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        bookingData.user_id,
        bookingData.charger_id,
        bookingData.booking_date,
        bookingData.start_time,
        bookingData.end_time,
        bookingData.total_amount
      ]
    );

    return result.rows[0];
  }

  /**
   * Find booking by ID
   */
  static async findById(id: string): Promise<Booking | null> {
    const result = await query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find booking with details (joins with charger, booth, user)
   */
  static async findByIdWithDetails(id: string): Promise<BookingWithDetails | null> {
    const result = await query(
      `SELECT 
        b.*,
        c.charger_name,
        c.charger_type,
        bo.name as booth_name,
        u.full_name as user_name
       FROM bookings b
       JOIN chargers c ON b.charger_id = c.id
       JOIN booths bo ON c.booth_id = bo.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all bookings by user
   */
  static async findByUser(userId: string): Promise<BookingWithDetails[]> {
    const result = await query(
      `SELECT 
        b.*,
        c.charger_name,
        c.charger_type,
        bo.name as booth_name
       FROM bookings b
       JOIN chargers c ON b.charger_id = c.id
       JOIN booths bo ON c.booth_id = bo.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Find bookings by charger and date
   */
  static async findByChargerAndDate(
    chargerId: string,
    bookingDate: string
  ): Promise<Booking[]> {
    const result = await query(
      `SELECT * FROM bookings
       WHERE charger_id = $1 AND booking_date = $2
       ORDER BY start_time`,
      [chargerId, bookingDate]
    );

    return result.rows;
  }

  /**
   * Update booking status
   */
  static async updateStatus(
    id: string,
    status: Booking['status']
  ): Promise<Booking> {
    const result = await query(
      `UPDATE bookings
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  /**
   * Get bookings for a booth owner
   */
  static async findByBoothOwner(ownerId: string): Promise<BookingWithDetails[]> {
    const result = await query(
      `SELECT 
        b.*,
        c.charger_name,
        c.charger_type,
        bo.name as booth_name,
        u.full_name as user_name
       FROM bookings b
       JOIN chargers c ON b.charger_id = c.id
       JOIN booths bo ON c.booth_id = bo.id
       JOIN users u ON b.user_id = u.id
       WHERE bo.owner_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [ownerId]
    );

    return result.rows;
  }
}

