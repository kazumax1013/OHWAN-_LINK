/*
  # Add daily_reports table

  1. New Tables
    - `daily_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `start_time` (text)
      - `end_time` (text)
      - `content` (text)
      - `tomorrow` (text)
      - `remarks` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on daily_reports table
    - Users can view their own reports
    - Admins and editors can view all reports
    - Users can create and update their own reports
*/

CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  content text NOT NULL,
  tomorrow text DEFAULT '',
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and editors can view all reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can create own reports"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON daily_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON daily_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date DESC);