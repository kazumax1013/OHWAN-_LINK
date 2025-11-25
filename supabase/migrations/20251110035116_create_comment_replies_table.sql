/*
  # Create comment replies table

  1. New Tables
    - `comment_replies`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, foreign key to comments)
      - `user_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `comment_replies` table
    - Add policy for authenticated users to read all replies
    - Add policy for authenticated users to create their own replies
    - Add policy for users to update their own replies
    - Add policy for users to delete their own replies
*/

CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comment replies"
  ON comment_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comment replies"
  ON comment_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comment replies"
  ON comment_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment replies"
  ON comment_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_user_id ON comment_replies(user_id);