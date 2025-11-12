/**
 * Station Model
 * Handles station-related database operations
 */
import { query } from '../config/database';

export interface Station {
  station_id: number;
  station_name: string;
  location: string;
  total_revenue: number;
  created_at: Date;
}

export interface CreateStationData {
  station_name: string;
  location: string;
}

export class StationModel {
  /**
   * Create a new station
   */
  static async create(stationData: CreateStationData): Promise<Station> {
    const result = await query(
      `INSERT INTO stations (station_name, location)
       VALUES ($1, $2)
       RETURNING *`,
      [stationData.station_name, stationData.location]
    );

    return result.rows[0];
  }

  /**
   * Find all stations
   */
  static async findAll(): Promise<Station[]> {
    const result = await query(
      'SELECT * FROM stations ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Find station by ID
   */
  static async findById(id: number): Promise<Station | null> {
    const result = await query(
      'SELECT * FROM stations WHERE station_id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete station
   */
  static async delete(id: number): Promise<void> {
    await query('DELETE FROM stations WHERE station_id = $1', [id]);
  }
}

