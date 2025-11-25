/*
  # Create Properties Table

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text) - 物件名
      - `client` (text) - クライアント名
      - `start_date` (timestamptz) - 開始日
      - `end_date` (timestamptz) - 終了日
      - `location` (text) - エリア
      - `construction_location` (text) - 施工場所
      - `notes` (text) - 備考
      - `color_name` (text) - カラー名
      - `color_bg` (text) - 背景グラデーション
      - `color_text` (text) - テキスト色
      - `color_light` (text) - 明るい背景色
      - `created_by` (uuid) - 作成者
      - `attendee_count` (integer) - 参加予定人数
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `properties` table
    - Add policy for authenticated users to read all properties
    - Add policy for authenticated users to insert their own properties
    - Add policy for authenticated users to update their own properties
    - Add policy for authenticated users to delete their own properties
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text DEFAULT 'tokyo',
  construction_location text DEFAULT '',
  notes text DEFAULT '',
  color_name text DEFAULT 'デフォルト',
  color_bg text DEFAULT 'from-primary-600 to-primary-400',
  color_text text DEFAULT 'text-primary-700',
  color_light text DEFAULT 'bg-primary-50',
  created_by uuid NOT NULL REFERENCES profiles(id),
  attendee_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS properties_created_by_idx ON properties(created_by);
CREATE INDEX IF NOT EXISTS properties_start_date_idx ON properties(start_date);
CREATE INDEX IF NOT EXISTS properties_end_date_idx ON properties(end_date);
