/**
 * Booth Model
 * Handles charging booth-related database operations
 */
import { query } from '../config/database';

export interface Booth {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBoothData {
  owner_id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
}

export class BoothModel {
  /**
   * Create a new booth
   */
  static async create(boothData: CreateBoothData): Promise<Booth> {
    const result = await query(
      `INSERT INTO booths (owner_id, name, address, city, state, zip_code, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        boothData.owner_id,
        boothData.name,
        boothData.address,
        boothData.city,
        boothData.state || null,
        boothData.zip_code || null,
        boothData.latitude || null,
        boothData.longitude || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Find booth by ID
   */
  static async findById(id: string): Promise<Booth | null> {
    const result = await query(
      'SELECT * FROM booths WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all booths by owner
   */
  static async findByOwner(ownerId: string): Promise<Booth[]> {
    const result = await query(
      'SELECT * FROM booths WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId]
    );

    return result.rows;
  }

  /**
   * Get all active booths
   */
  static async findAllActive(): Promise<Booth[]> {
    const result = await query(
      'SELECT * FROM booths WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Update booth
   */
  static async update(id: string, updates: Partial<CreateBoothData>): Promise<Booth> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE booths SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }
}

