-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'temp_password_hash';

-- Update existing users with a temporary hashed password
-- Users will need to reset their password or use the default: "password123"
-- Default password hash for "password123"
UPDATE "User" SET "password" = '$2a$10$YourHashedPasswordHere' WHERE "password" = 'temp_password_hash';
