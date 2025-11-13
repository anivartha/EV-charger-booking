/**
 * User Model
 * Handles user-related database operations
 */
import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username?: string;
  password?: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'user' | 'owner' | 'admin';
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  is_approved: boolean;
  created_at: Date;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<UserPublic> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, is_approved, created_at`,
      [
        userData.email,
        hashedPassword,
        userData.full_name,
        userData.phone || null,
        userData.role || 'user'
      ]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserPublic | null> {
    const result = await query(
      `SELECT id, email, full_name, phone, role, is_approved, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Verify password
   */
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  /**
   * Update user approval status (for owners)
   */
  static async updateApprovalStatus(id: string, isApproved: boolean): Promise<void> {
    await query(
      'UPDATE users SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isApproved, id]
    );
  }

  /**
   * Get all owners pending approval
   */
  static async getPendingOwners(): Promise<UserPublic[]> {
    const result = await query(
      `SELECT id, email, full_name, phone, role, is_approved, created_at
       FROM users
       WHERE role = 'owner' AND is_approved = FALSE
       ORDER BY created_at DESC`
    );

    return result.rows;
  }

  /**
   * Find user by username and role (for simple login)
   */
  static async findByUsernameAndRole(username: string, role: 'admin' | 'user'): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      [username, role]
    );

    return result.rows[0] || null;
  }

  /**
   * Create user with username and password (simple registration)
   */
  static async createSimple(userData: {
    username: string;
    password: string;
    role?: 'admin' | 'user';
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (username, password, role, email, full_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userData.username,
        userData.password, // Store plain text as per requirements (no security)
        userData.role || 'user',
        `${userData.username}@example.com`, // Dummy email
        userData.username // Use username as full_name
      ]
    );

    return result.rows[0];
  }
}

