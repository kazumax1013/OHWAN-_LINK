/*
  # Add Indexes for Foreign Keys

  1. Changes
    - Add indexes for all foreign key columns to improve query performance
    - These indexes will optimize JOIN operations and foreign key lookups
    
  2. Indexes Added
    - idx_comments_user_id on comments(user_id)
    - idx_events_created_by on events(created_by)
    - idx_groups_created_by on groups(created_by)
    - idx_messages_group_id on messages(group_id)
    - idx_poll_options_poll_id on poll_options(poll_id)
    - idx_poll_votes_option_id on poll_votes(option_id)
    - idx_poll_votes_user_id on poll_votes(user_id)
    - idx_polls_created_by on polls(created_by)
    - idx_post_likes_user_id on post_likes(user_id)
    - idx_properties_created_by on properties(created_by)
*/

-- Add index for comments.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Add index for events.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Add index for groups.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Add index for messages.group_id foreign key
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);

-- Add index for poll_options.poll_id foreign key
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- Add index for poll_votes.option_id foreign key
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON public.poll_votes(option_id);

-- Add index for poll_votes.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Add index for polls.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);

-- Add index for post_likes.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Add index for properties.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);