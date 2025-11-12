/**
 * Authentication Routes
 * Handles user registration and login endpoints
 */
import { Router } from 'express';
import { register, login, registerSimple } from '../controllers/authController';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation middleware for simple login (username + role)
const simpleLoginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('role').isIn(['admin', 'user']).withMessage('Role must be either "admin" or "user"'),
  handleValidationErrors
];

// Validation middleware for simple register
const simpleRegisterValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either "admin" or "user"'),
  handleValidationErrors
];

// Original validation middleware (kept for backward compatibility)
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('role').optional().isIn(['user', 'owner', 'admin']).withMessage('Role must be user, owner, or admin'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * @route   POST /api/auth/login
 * @desc    Simple login - checks username + role (no password validation)
 * @access  Public
 */
router.post('/login', simpleLoginValidation, login);

/**
 * @route   POST /api/auth/register
 * @desc    Simple register - creates user with username, password, role
 * @access  Public
 */
router.post('/register', simpleRegisterValidation, registerSimple);

// Keep original endpoints for backward compatibility
router.post('/register-email', registerValidation, register);
router.post('/login-email', loginValidation, login);

export default router;

