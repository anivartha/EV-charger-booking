/**
 * Complaint Model
 * Handles complaint-related database operations
 */
import { query } from '../config/database';

export interface Complaint {
  id: string;
  user_id: string;
  booking_id?: string;
  booth_id?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateComplaintData {
  user_id: string;
  booking_id?: string;
  booth_id?: string;
  title: string;
  description: string;
}

export class ComplaintModel {
  /**
   * Create a new complaint
   */
  static async create(complaintData: CreateComplaintData): Promise<Complaint> {
    const result = await query(
      `INSERT INTO complaints (user_id, booking_id, booth_id, title, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        complaintData.user_id,
        complaintData.booking_id || null,
        complaintData.booth_id || null,
        complaintData.title,
        complaintData.description
      ]
    );

    return result.rows[0];
  }

  /**
   * Find complaint by ID
   */
  static async findById(id: string): Promise<Complaint | null> {
    const result = await query(
      'SELECT * FROM complaints WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all complaints by user
   */
  static async findByUser(userId: string): Promise<Complaint[]> {
    const result = await query(
      'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows;
  }

  /**
   * Get all complaints (for admin)
   */
  static async findAll(): Promise<Complaint[]> {
    const result = await query(
      'SELECT * FROM complaints ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Get complaints by status
   */
  static async findByStatus(status: Complaint['status']): Promise<Complaint[]> {
    const result = await query(
      'SELECT * FROM complaints WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    return result.rows;
  }

  /**
   * Update complaint status and admin response
   */
  static async update(
    id: string,
    status?: Complaint['status'],
    adminResponse?: string
  ): Promise<Complaint> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (adminResponse !== undefined) {
      updates.push(`admin_response = $${paramCount}`);
      values.push(adminResponse);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE complaints SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }
}

