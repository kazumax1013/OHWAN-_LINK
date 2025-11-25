/*
  # Increase attachments bucket file size limit to 500MB

  1. Changes
    - Increase file_size_limit for attachments bucket to 524288000 bytes (500 MB)
    - This allows very large files like videos, large PDFs, design files to be uploaded
  
  2. Security
    - No security changes, existing RLS policies remain in place
  
  3. Notes
    - Large file uploads may take longer to complete
    - Users should have stable internet connection for large uploads
*/

UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE name = 'attachments';