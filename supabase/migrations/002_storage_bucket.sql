-- Run this in Supabase SQL Editor as service role / postgres admin
-- Note: RLS on storage tables requires elevated permissions

-- Create bucket (already done manually, safe to re-run)
INSERT INTO storage.buckets (id, name, public)
VALUES ('influencers', 'influencers', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on bucket
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- RLS policies for buckets
DROP POLICY IF EXISTS "Users can view influencers bucket" ON storage.buckets;
CREATE POLICY "Users can view influencers bucket" ON storage.buckets
  FOR SELECT USING (id = 'influencers');

-- RLS policies for objects (files)
DROP POLICY IF EXISTS "Users can upload influencer images" ON storage.objects;
CREATE POLICY "Users can upload influencer images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'influencers' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own influencer images" ON storage.objects;
CREATE POLICY "Users can view own influencer images" ON storage.objects
  FOR SELECT USING (bucket_id = 'influencers' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own influencer images" ON storage.objects;
CREATE POLICY "Users can update own influencer images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'influencers' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own influencer images" ON storage.objects;
CREATE POLICY "Users can delete own influencer images" ON storage.objects
  FOR DELETE USING (bucket_id = 'influencers' AND auth.uid() = user_id);