/*
  # Add cover image support to profiles

  1. Changes
    - Add `cover_image_url` column to `profiles` table to store user's profile cover/background image
    - Column is nullable to allow users without cover images
    
  2. Notes
    - Existing profiles will have NULL cover_image_url by default
    - Users can upload cover images up to 50MB via the storage bucket
*/

-- Add cover_image_url column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cover_image_url text;
  END IF;
END $$;
