/*
  # Create Attachments Table

  1. New Tables
    - `attachments`
      - `id` (uuid, primary key)
      - `file_name` (text) - ファイル名
      - `file_url` (text) - ファイルURL
      - `file_type` (text) - ファイルタイプ (image/jpeg, application/pdf, etc.)
      - `file_size` (bigint) - ファイルサイズ（バイト）
      - `source_type` (text) - 送信元タイプ ('post', 'message')
      - `source_id` (uuid) - 送信元ID (posts.id または messages.id)
      - `uploaded_by` (uuid) - アップロード者
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `attachments` table
    - Add policies for authenticated users to:
      - View all attachments
      - Insert their own attachments
      - Delete their own attachments

  3. Indexes
    - Add indexes for better query performance
*/

CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  source_type text NOT NULL CHECK (source_type IN ('post', 'message')),
  source_id uuid NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attachments"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own attachments"
  ON attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE INDEX IF NOT EXISTS attachments_source_type_id_idx ON attachments(source_type, source_id);
CREATE INDEX IF NOT EXISTS attachments_uploaded_by_idx ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS attachments_created_at_idx ON attachments(created_at DESC);
