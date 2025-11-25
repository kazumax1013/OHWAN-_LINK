/*
  # Initial Schema for OHWAN LINK

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `department` (text)
      - `position` (text)
      - `avatar_url` (text)
      - `skills` (text array)
      - `interests` (text array)
      - `role` (text) - 'admin', 'editor', 'user'
      - `joined_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `image_url` (text, nullable)
      - `likes_count` (integer)
      - `comments_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (post_id, user_id)

    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text, nullable)
      - `created_by` (uuid, references profiles)
      - `member_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references profiles)
      - `role` (text) - 'admin', 'member'
      - `joined_at` (timestamptz)
      - Unique constraint on (group_id, user_id)

    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `recipient_id` (uuid, references profiles, nullable)
      - `group_id` (uuid, references groups, nullable)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamptz)

    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `location` (text, nullable)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `polls`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `created_by` (uuid, references profiles)
      - `ends_at` (timestamptz)
      - `created_at` (timestamptz)

    - `poll_options`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `option_text` (text)
      - `vote_count` (integer)

    - `poll_votes`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `option_id` (uuid, references poll_options)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (poll_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all profiles
      - Update their own profile
      - Create posts and read all posts
      - Like posts and see likes
      - Comment on posts
      - Create and join groups
      - Send and receive messages
      - Create events and polls
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL DEFAULT '',
  position text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  role text NOT NULL DEFAULT 'user',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can delete groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = messages.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls"
  ON polls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  vote_count integer DEFAULT 0
);

ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options"
  ON poll_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Poll creators can add options"
  ON poll_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON poll_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote"
  ON poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);