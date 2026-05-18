-- Posts table corrections and storage bucket for posts

-- Fix posts table: add NOT NULL constraints and caption column
ALTER TABLE posts ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE posts ALTER COLUMN platform SET NOT NULL;

-- Add caption column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'caption'
  ) THEN
    ALTER TABLE posts ADD COLUMN caption TEXT;
  END IF;
END $$;

-- Remove credits_spent column if it exists (not needed per schema)
-- ALTER TABLE posts DROP COLUMN IF EXISTS credits_spent;

-- Add credits_spent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'credits_spent'
  ) THEN
    ALTER TABLE posts ADD COLUMN credits_spent INTEGER DEFAULT 10;
  END IF;
END $$;

-- Remove updated_at if not needed (optional cleanup)
-- ALTER TABLE posts DROP COLUMN IF EXISTS updated_at;

-- Create storage bucket for posts images
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for posts bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for posts bucket

-- Allow authenticated uploads to posts bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to posts" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to posts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'posts' AND auth.uid() = user_id);

-- Allow public read access to posts bucket
DROP POLICY IF EXISTS "Allow public read from posts" ON storage.objects;
CREATE POLICY "Allow public read from posts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'posts');

-- Allow users to view their own posts in storage
DROP POLICY IF EXISTS "Users can view own post images" ON storage.objects;
CREATE POLICY "Users can view own post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts' AND auth.uid() = user_id);

-- Allow users to delete their own posts in storage
DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;
CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.uid() = user_id);

-- Allow users to update their own posts in storage
DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
CREATE POLICY "Users can update own post images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posts' AND auth.uid() = user_id);