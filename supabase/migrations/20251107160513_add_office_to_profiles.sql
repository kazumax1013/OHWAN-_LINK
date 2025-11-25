/*
  # Add office field to profiles table

  1. Changes
    - Add office column to profiles table for storing office location (大阪本社 or 東京営業所)
    
  2. Details
    - Column: office (text type)
    - Optional field with check constraint for valid values
    - Values: '大阪本社' or '東京営業所'
*/

-- Add office column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'office'
  ) THEN
    ALTER TABLE profiles ADD COLUMN office text;
    
    -- Add check constraint for valid office values
    ALTER TABLE profiles ADD CONSTRAINT profiles_office_check 
      CHECK (office IS NULL OR office IN ('大阪本社', '東京営業所'));
  END IF;
END $$;