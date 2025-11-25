/*
  # Remove Unused Indexes

  1. Changes
    - Drop unused indexes that are not being utilized by queries
    - This improves database performance by reducing maintenance overhead
    
  2. Indexes Removed
    - idx_comments_user_id on comments table
    - idx_events_created_by on events table
    - idx_groups_created_by on groups table
    - idx_poll_options_poll_id on poll_options table
    - idx_poll_votes_option_id on poll_votes table
    - idx_poll_votes_user_id on poll_votes table
    - idx_polls_created_by on polls table
    - idx_group_members_group_id on group_members table
    - idx_messages_group_id on messages table
    - idx_post_likes_user_id on post_likes table
    - properties_created_by_idx on properties table
    - properties_end_date_idx on properties table
    - idx_daily_reports_date on daily_reports table
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_groups_created_by;
DROP INDEX IF EXISTS idx_poll_options_poll_id;
DROP INDEX IF EXISTS idx_poll_votes_option_id;
DROP INDEX IF EXISTS idx_poll_votes_user_id;
DROP INDEX IF EXISTS idx_polls_created_by;
DROP INDEX IF EXISTS idx_group_members_group_id;
DROP INDEX IF EXISTS idx_messages_group_id;
DROP INDEX IF EXISTS idx_post_likes_user_id;
DROP INDEX IF EXISTS properties_created_by_idx;
DROP INDEX IF EXISTS properties_end_date_idx;
DROP INDEX IF EXISTS idx_daily_reports_date;