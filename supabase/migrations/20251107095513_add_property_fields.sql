/*
  # Add Property Fields

  1. Changes
    - Add `area` (text) - エリア field to properties table
    - Add `customer` (text) - 取引先 field to properties table  
    - Add `manager` (text) - 担当者 field to properties table
    
  2. Notes
    - These fields are optional and default to empty string
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'area'
  ) THEN
    ALTER TABLE properties ADD COLUMN area text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'customer'
  ) THEN
    ALTER TABLE properties ADD COLUMN customer text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'manager'
  ) THEN
    ALTER TABLE properties ADD COLUMN manager text DEFAULT '';
  END IF;
END $$;
