/**
 * Payment Model
 * Handles payment-related database operations
 */
import { query } from '../config/database';

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentData {
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
}

export class PaymentModel {
  /**
   * Create a new payment record
   */
  static async create(paymentData: CreatePaymentData): Promise<Payment> {
    const result = await query(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, payment_date)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        paymentData.booking_id,
        paymentData.user_id,
        paymentData.amount,
        paymentData.payment_method || null,
        paymentData.transaction_id || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Find payment by ID
   */
  static async findById(id: string): Promise<Payment | null> {
    const result = await query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find payment by booking ID
   */
  static async findByBooking(bookingId: string): Promise<Payment | null> {
    const result = await query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [bookingId]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all payments by user
   */
  static async findByUser(userId: string): Promise<Payment[]> {
    const result = await query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows;
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    id: string,
    status: Payment['payment_status']
  ): Promise<Payment> {
    const result = await query(
      `UPDATE payments
       SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }
}

