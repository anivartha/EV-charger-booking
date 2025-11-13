-- Migration: Add username, password, and role columns to users table
-- This migration enhances the users table for role-based authentication

BEGIN;

-- Add username column (unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add password column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add role column with check constraint (default 'user')
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_new ON users(role);

COMMIT;

