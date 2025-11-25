/*
  # Remove old daily_reports fields that are no longer used

  1. Changes
    - Remove `start_time` column (not-null constraint causing issues)
    - Remove `end_time` column (not-null constraint causing issues)
    - Remove `content` column (replaced by new fields)
    - Remove `tomorrow` column (replaced by tomorrow_plan)
    - Remove `remarks` column (no longer used)

  2. Notes
    - These fields are from the old schema and are no longer used
    - The new schema uses jsonb arrays for flexible input
*/

DO $$
BEGIN
  -- Drop start_time if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE daily_reports DROP COLUMN start_time;
  END IF;

  -- Drop end_time if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE daily_reports DROP COLUMN end_time;
  END IF;

  -- Drop content if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'content'
  ) THEN
    ALTER TABLE daily_reports DROP COLUMN content;
  END IF;

  -- Drop tomorrow if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'tomorrow'
  ) THEN
    ALTER TABLE daily_reports DROP COLUMN tomorrow;
  END IF;

  -- Drop remarks if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'remarks'
  ) THEN
    ALTER TABLE daily_reports DROP COLUMN remarks;
  END IF;
END $$;