-- Add zernio_profile_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zernio_profile_id TEXT;
