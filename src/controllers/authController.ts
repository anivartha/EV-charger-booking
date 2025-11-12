/**
 * Authentication Controller
 * Handles user registration and login
 */
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import jwt from 'jsonwebtoken';

export interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: 'user' | 'owner' | 'admin';
  };
}

export interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
    role: 'admin' | 'user';
  };
}

export interface SimpleLoginRequest extends Request {
  body: {
    username: string;
    role: 'admin' | 'user';
  };
}

/**
 * Register a new user
 */
export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      full_name,
      phone,
      role: role || 'user'
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_approved: user.is_approved
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

/**
 * Login user (simple - checks username + role, no password validation)
 */
export const login = async (req: SimpleLoginRequest, res: Response): Promise<void> => {
  try {
    const { username, role } = req.body;

    // Validate input
    if (!username || !role) {
      res.status(400).json({ error: 'Username and role are required' });
      return;
    }

    if (role !== 'admin' && role !== 'user') {
      res.status(400).json({ error: 'Role must be either "admin" or "user"' });
      return;
    }

    // Find user by username and role
    const user = await UserModel.findByUsernameAndRole(username, role);
    if (!user) {
      res.status(401).json({ error: 'Invalid username or role' });
      return;
    }

    // Return success (no password validation, no JWT as per requirements)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name || user.username
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};

/**
 * Register new user (simple - username, password, role)
 */
export const registerSimple = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findByUsernameAndRole(username, role || 'user');
    if (existingUser) {
      res.status(400).json({ error: 'User with this username already exists' });
      return;
    }

    // Create user (role defaults to 'user' if not provided)
    const user = await UserModel.createSimple({
      username,
      password, // Stored as plain text (no security as per requirements)
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

