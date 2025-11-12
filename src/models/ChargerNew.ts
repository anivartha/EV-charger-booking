/**
 * Charger Model (New Schema)
 * Handles charger-related database operations
 */
import { query } from '../config/database';

export interface ChargerNew {
  charger_id: number;
  station_id: number;
  charger_type: string;
  power_kw: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  created_at: Date;
}

export interface CreateChargerData {
  station_id: number;
  charger_type: string;
  power_kw: number;
}

export class ChargerNewModel {
  /**
   * Create a new charger
   */
  static async create(chargerData: CreateChargerData): Promise<ChargerNew> {
    const result = await query(
      `INSERT INTO chargers_new (station_id, charger_type, power_kw)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [chargerData.station_id, chargerData.charger_type, chargerData.power_kw]
    );

    return result.rows[0];
  }

  /**
   * Find all chargers
   */
  static async findAll(): Promise<ChargerNew[]> {
    const result = await query(
      'SELECT * FROM chargers_new ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Find chargers by station
   */
  static async findByStation(stationId: number): Promise<ChargerNew[]> {
    const result = await query(
      'SELECT * FROM chargers_new WHERE station_id = $1 ORDER BY created_at DESC',
      [stationId]
    );

    return result.rows;
  }

  /**
   * Find charger by ID
   */
  static async findById(id: number): Promise<ChargerNew | null> {
    const result = await query(
      'SELECT * FROM chargers_new WHERE charger_id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update charger status
   */
  static async updateStatus(
    id: number,
    status: 'Available' | 'Occupied' | 'Maintenance'
  ): Promise<ChargerNew> {
    const result = await query(
      `UPDATE chargers_new
       SET status = $1
       WHERE charger_id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  /**
   * Delete charger
   */
  static async delete(id: number): Promise<void> {
    await query('DELETE FROM chargers_new WHERE charger_id = $1', [id]);
  }
}

