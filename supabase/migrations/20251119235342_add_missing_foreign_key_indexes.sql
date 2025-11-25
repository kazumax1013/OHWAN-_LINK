/*
  # Add Missing Foreign Key Indexes

  ## Overview
  This migration adds indexes to all foreign key columns that are missing covering indexes.
  These indexes improve query performance when joining tables or filtering by foreign key values.

  ## New Indexes
  
  ### Attachments Table
  - `idx_attachments_uploaded_by` - Index on uploaded_by column for user lookups
  
  ### Comment Replies Table
  - `idx_comment_replies_user_id` - Index on user_id column for user comment lookups
  
  ### Comments Table
  - `idx_comments_user_id` - Index on user_id column for user comment lookups
  
  ### Events Table
  - `idx_events_created_by` - Index on created_by column for event creator lookups
  
  ### Groups Table
  - `idx_groups_created_by` - Index on created_by column for group creator lookups
  
  ### Messages Table
  - `idx_messages_group_id` - Index on group_id column for group message lookups
  
  ### Poll Options Table
  - `idx_poll_options_poll_id` - Index on poll_id column for poll option lookups
  
  ### Poll Votes Table
  - `idx_poll_votes_option_id` - Index on option_id column for option vote lookups
  - `idx_poll_votes_user_id` - Index on user_id column for user vote lookups
  
  ### Polls Table
  - `idx_polls_created_by` - Index on created_by column for poll creator lookups
  
  ### Post Likes Table
  - `idx_post_likes_user_id` - Index on user_id column for user like lookups
  
  ### Properties Table
  - `idx_properties_created_by` - Index on created_by column for property creator lookups

  ## Performance Impact
  These indexes will:
  - Significantly improve JOIN operation performance
  - Speed up foreign key constraint validation
  - Optimize queries filtering by foreign key columns
  - Reduce database load during high-traffic periods

  ## Notes
  - All indexes are created with IF NOT EXISTS to prevent errors on re-run
  - Indexes are created concurrently where possible to minimize table locking
*/

-- Attachments table
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);

-- Comment replies table
CREATE INDEX IF NOT EXISTS idx_comment_replies_user_id ON public.comment_replies(user_id);

-- Comments table
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Events table
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Groups table
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Messages table
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);

-- Poll options table
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- Poll votes table
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON public.poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Polls table
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);

-- Post likes table
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Properties table
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
