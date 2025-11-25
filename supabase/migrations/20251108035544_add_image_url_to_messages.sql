/*
  # Add image_url field to messages table

  1. Schema Changes
    - Add `image_url` column to messages table for storing image attachments

  ## Details
  This migration adds support for image attachments in messages by adding
  an optional image_url field that stores the Supabase Storage URL of uploaded images.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN image_url text;
  END IF;
END $$;
