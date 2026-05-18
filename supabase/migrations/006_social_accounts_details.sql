-- Add additional columns to social_accounts for richer account data
ALTER TABLE social_accounts 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS followers_count INTEGER,
ADD COLUMN IF NOT EXISTS profile_url TEXT,
ADD COLUMN IF NOT EXISTS zernio_data JSONB;
