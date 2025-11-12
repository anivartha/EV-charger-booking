-- Migration: Add username, password, and role fields to users table
-- This modifies the existing users table to support role-based login

BEGIN;

-- Add username column (unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add password column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Modify role column to match new requirements
-- First, update existing role values if needed
UPDATE users 
SET role = LOWER(role) 
WHERE role IS NOT NULL;

-- Drop existing role constraint if it exists and recreate
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new role constraint with 'admin' and 'user' (lowercase)
ALTER TABLE users 
ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));

-- Set default role to 'user' if not already set
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'user';

-- Update existing records: if role is 'owner', change to 'user'
UPDATE users 
SET role = 'user' 
WHERE role = 'owner';

COMMIT;

