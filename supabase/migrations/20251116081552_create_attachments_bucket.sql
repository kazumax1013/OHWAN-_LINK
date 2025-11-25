/*
  # Create attachments storage bucket

  1. Storage Setup
    - Create `attachments` bucket for storing message attachments, images, and documents
    - Set bucket to be public for easy access
    - Enable RLS policies for upload/delete operations

  2. Security
    - Allow authenticated users to upload attachments
    - Allow authenticated users to delete their own attachments
    - Public read access for all attachments
*/

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload attachments
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Allow authenticated users to update their own attachments
CREATE POLICY "Users can update their own attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all attachments
CREATE POLICY "Public access to attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');
