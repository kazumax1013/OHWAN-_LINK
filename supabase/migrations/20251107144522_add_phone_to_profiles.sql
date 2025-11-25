/*
  # Add phone number field to profiles table

  1. Changes
    - Add `phone` column to `profiles` table
      - Type: text
      - Optional field (can be null)
      - Default: null
  
  2. Notes
    - This allows users to store their phone number in their profile
    - No RLS changes needed as existing policies cover this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;