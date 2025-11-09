/**
 * Validation Middleware
 * Handles express-validator errors
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));

    res.status(400).json({
      error: 'Validation failed',
      errors: errorMessages
    });
    return;
  }

  next();
};

