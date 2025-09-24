-- Create find-images storage bucket for found item photos
-- Run this in your Supabase SQL Editor

-- Create the find-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('find-images', 'find-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for find-images bucket
-- Allow authenticated users to upload find images
CREATE POLICY "Users can upload find images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'find-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view find images (public bucket)
CREATE POLICY "Anyone can view find images" ON storage.objects
FOR SELECT USING (bucket_id = 'find-images');

-- Allow users to update their own find images
CREATE POLICY "Users can update their own find images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'find-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own find images
CREATE POLICY "Users can delete their own find images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'find-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the bucket was created
SELECT 'find-images storage bucket created successfully!' as status;
















