/*
  # Fix properties table date columns

  1. Changes
    - Change start_date and end_date from timestamptz to date type
    - This prevents timezone conversion issues when storing dates
    - Dates will be stored as simple dates without time information
  
  2. Notes
    - Data will be preserved during conversion
    - The time portion will be truncated, keeping only the date
*/

-- Change start_date and end_date columns to date type
ALTER TABLE properties 
  ALTER COLUMN start_date TYPE date USING start_date::date,
  ALTER COLUMN end_date TYPE date USING end_date::date;