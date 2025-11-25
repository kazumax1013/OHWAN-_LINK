/*
  # Add image_urls array to posts table

  1. Schema Changes
    - Add `image_urls` column (text array) to posts table for storing multiple image URLs
    - Keep existing `image_url` column for backward compatibility

  ## Details
  This migration adds support for multiple image attachments in posts by adding
  an image_urls array field that stores multiple Supabase Storage URLs.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE posts ADD COLUMN image_urls text[];
  END IF;
END $$;
