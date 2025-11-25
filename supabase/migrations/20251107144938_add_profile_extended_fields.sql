/*
  # Add extended profile fields

  1. Changes
    - Add `motto` column to `profiles` table (座右の銘)
      - Type: text
      - Optional field (can be null)
    - Add `hobbies` column to `profiles` table (趣味)
      - Type: text
      - Optional field (can be null)
    - Add `introduction` column to `profiles` table (自己紹介)
      - Type: text
      - Optional field (can be null)
  
  2. Notes
    - Birthday field already exists as `birthday`
    - These fields allow users to store extended profile information
    - No RLS changes needed as existing policies cover these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'motto'
  ) THEN
    ALTER TABLE profiles ADD COLUMN motto text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hobbies'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hobbies text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'introduction'
  ) THEN
    ALTER TABLE profiles ADD COLUMN introduction text;
  END IF;
END $$;