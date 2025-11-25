/*
  # Increase attachments bucket file size limit to 100MB

  1. Changes
    - Increase file_size_limit for attachments bucket to 104857600 bytes (100 MB)
    - This allows larger files like large PDFs, videos, AI, PSD files to be uploaded
  
  2. Security
    - No security changes, existing RLS policies remain in place
*/

UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE name = 'attachments';