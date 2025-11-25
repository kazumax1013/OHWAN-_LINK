/*
  # Update daily_reports fields to support multiple entries

  1. Changes
    - Change text fields to jsonb arrays to support multiple entries:
      - `site_work` (今日の現場) - jsonb array
      - `delivery` (今日の納品) - jsonb array
      - `meeting` (今日の打ち合わせ) - jsonb array
      - `production` (今日の制作作業) - jsonb array
      - `estimate` (今日の見積書) - jsonb array
      - `tomorrow_plan` (明日の予定) - jsonb array
      - `future_plan` (先の予定) - jsonb array

  2. Notes
    - Each field will store an array of strings
    - This allows users to add multiple entries per category
    - Existing data will be migrated to array format
*/

DO $$
BEGIN
  -- Convert site_work to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'site_work' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN site_work DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN site_work TYPE jsonb 
      USING CASE 
        WHEN site_work IS NULL OR site_work = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(site_work)
      END;
    ALTER TABLE daily_reports ALTER COLUMN site_work SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert delivery to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'delivery' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN delivery DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN delivery TYPE jsonb 
      USING CASE 
        WHEN delivery IS NULL OR delivery = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(delivery)
      END;
    ALTER TABLE daily_reports ALTER COLUMN delivery SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert meeting to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'meeting' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN meeting DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN meeting TYPE jsonb 
      USING CASE 
        WHEN meeting IS NULL OR meeting = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(meeting)
      END;
    ALTER TABLE daily_reports ALTER COLUMN meeting SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert production to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'production' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN production DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN production TYPE jsonb 
      USING CASE 
        WHEN production IS NULL OR production = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(production)
      END;
    ALTER TABLE daily_reports ALTER COLUMN production SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert estimate to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'estimate' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN estimate DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN estimate TYPE jsonb 
      USING CASE 
        WHEN estimate IS NULL OR estimate = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(estimate)
      END;
    ALTER TABLE daily_reports ALTER COLUMN estimate SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert tomorrow_plan to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'tomorrow_plan' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN tomorrow_plan DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN tomorrow_plan TYPE jsonb 
      USING CASE 
        WHEN tomorrow_plan IS NULL OR tomorrow_plan = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(tomorrow_plan)
      END;
    ALTER TABLE daily_reports ALTER COLUMN tomorrow_plan SET DEFAULT '[]'::jsonb;
  END IF;

  -- Convert future_plan to jsonb array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'future_plan' AND data_type = 'text'
  ) THEN
    ALTER TABLE daily_reports ALTER COLUMN future_plan DROP DEFAULT;
    ALTER TABLE daily_reports 
      ALTER COLUMN future_plan TYPE jsonb 
      USING CASE 
        WHEN future_plan IS NULL OR future_plan = '' THEN '[]'::jsonb
        ELSE jsonb_build_array(future_plan)
      END;
    ALTER TABLE daily_reports ALTER COLUMN future_plan SET DEFAULT '[]'::jsonb;
  END IF;
END $$;