/*
  # Create follows table for user following functionality

  1. New Tables
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles.id) - user who follows
      - `following_id` (uuid, references profiles.id) - user being followed
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `follows` table
    - Add policy for authenticated users to follow others
    - Add policy for authenticated users to unfollow
    - Add policy for users to view follows
    
  3. Indexes
    - Index on follower_id for quick lookup of who a user follows
    - Index on following_id for quick lookup of a user's followers
    - Unique constraint on (follower_id, following_id) to prevent duplicate follows
*/

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy for viewing follows
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

-- Policy for creating follows
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Policy for deleting follows (unfollow)
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows(created_at DESC);