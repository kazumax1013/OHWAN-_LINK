/*
  # Update attachments bucket file size limit

  1. Changes
    - Increase file_size_limit for attachments bucket to 52428800 bytes (50 MB)
    - This allows larger files like PDFs, AI, PSD files to be uploaded
  
  2. Security
    - No security changes, existing RLS policies remain in place
*/

UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE name = 'attachments';