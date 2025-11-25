/*
  # Fix Security Issues - Add Missing Indexes

  1. Performance Improvements
    - Add indexes on all foreign key columns that are missing them
    - This improves query performance for joins and foreign key lookups

  2. Indexes Added
    - comments.user_id
    - events.created_by
    - groups.created_by
    - poll_options.poll_id
    - poll_votes.option_id
    - poll_votes.user_id
    - polls.created_by
    - post_likes.user_id
*/

-- Add index on comments.user_id
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Add index on events.created_by
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Add index on groups.created_by
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Add index on poll_options.poll_id
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- Add index on poll_votes.option_id
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON public.poll_votes(option_id);

-- Add index on poll_votes.user_id
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Add index on polls.created_by
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);

-- Add index on post_likes.user_id
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);