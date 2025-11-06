-- Add bio column to users table
-- This will fail if the column already exists, which is fine
ALTER TABLE users ADD COLUMN bio TEXT AFTER name;
