/*
  # Update storage bucket to allow all file types

  1. Changes
    - Update the `images` bucket to allow all file types (not just images)
    - Add support for PDF, Excel, Word, PowerPoint, Photoshop, and Illustrator files
    - Increase file size limit to 10MB for larger documents
    - Remove MIME type restrictions to allow all file formats

  2. New Allowed File Types
    - Images: JPEG, PNG, GIF, WebP
    - Documents: PDF, DOC, DOCX
    - Spreadsheets: XLS, XLSX
    - Presentations: PPT, PPTX
    - Design files: PSD, AI
*/

-- Update the storage bucket to allow all file types
UPDATE storage.buckets
SET 
  allowed_mime_types = NULL,
  file_size_limit = 10485760
WHERE id = 'images';
