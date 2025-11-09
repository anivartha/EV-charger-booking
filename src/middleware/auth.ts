/**
 * Authentication Middleware
 * Handles JWT token verification and role-based access control
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'owner' | 'admin';
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: 'user' | 'owner' | 'admin';
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: ('user' | 'owner' | 'admin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Check if user is owner and approved
 */
export const requireApprovedOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // This would need to check the database for is_approved status
  // For now, we'll just check the role
  if (!req.user || req.user.role !== 'owner') {
    res.status(403).json({ error: 'Owner access required' });
    return;
  }

  next();
};

