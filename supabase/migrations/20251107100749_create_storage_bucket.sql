/*
  # Create storage bucket for images

  1. Storage Setup
    - Create `images` bucket for storing user avatars, post images, and other media
    - Set bucket to be public for easy access
    - Enable RLS policies for upload/delete operations

  2. Security
    - Allow authenticated users to upload images
    - Allow authenticated users to delete their own images
    - Public read access for all images
*/

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all images
CREATE POLICY "Public access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');