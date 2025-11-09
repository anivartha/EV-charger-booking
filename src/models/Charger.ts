/**
 * Charger Model
 * Handles charger-related database operations
 */
import { query } from '../config/database';

export interface Charger {
  id: string;
  booth_id: string;
  charger_name: string;
  charger_type: string;
  power_rating_kw: number;
  price_per_hour: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChargerData {
  booth_id: string;
  charger_name: string;
  charger_type: string;
  power_rating_kw: number;
  price_per_hour: number;
}

export class ChargerModel {
  /**
   * Create a new charger
   */
  static async create(chargerData: CreateChargerData): Promise<Charger> {
    const result = await query(
      `INSERT INTO chargers (booth_id, charger_name, charger_type, power_rating_kw, price_per_hour)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        chargerData.booth_id,
        chargerData.charger_name,
        chargerData.charger_type,
        chargerData.power_rating_kw,
        chargerData.price_per_hour
      ]
    );

    return result.rows[0];
  }

  /**
   * Find charger by ID
   */
  static async findById(id: string): Promise<Charger | null> {
    const result = await query(
      'SELECT * FROM chargers WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all chargers by booth
   */
  static async findByBooth(boothId: string): Promise<Charger[]> {
    const result = await query(
      'SELECT * FROM chargers WHERE booth_id = $1 ORDER BY created_at DESC',
      [boothId]
    );

    return result.rows;
  }

  /**
   * Get all active chargers
   */
  static async findAllActive(): Promise<Charger[]> {
    const result = await query(
      'SELECT * FROM chargers WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Check if charger is available for a time slot
   */
  static async isAvailable(
    chargerId: string,
    bookingDate: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM bookings
       WHERE charger_id = $1
         AND booking_date = $2
         AND status IN ('pending', 'confirmed')
         AND (
           (start_time <= $3 AND end_time > $3)
           OR (start_time < $4 AND end_time >= $4)
           OR (start_time >= $3 AND end_time <= $4)
         )`,
      [chargerId, bookingDate, startTime, endTime]
    );

    return parseInt(result.rows[0].count) === 0;
  }
}

