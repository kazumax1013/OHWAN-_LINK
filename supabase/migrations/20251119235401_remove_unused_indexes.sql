/*
  # Remove Unused Indexes

  ## Overview
  This migration removes indexes that are not being used by any queries.
  Unused indexes consume disk space and slow down write operations without providing any benefit.

  ## Indexes Being Removed
  
  ### Comment Replies Table
  - `idx_comment_replies_parent_reply_id` - Not used by any queries
  
  ### Properties Table
  - `properties_start_date_idx` - Not used by any queries
  
  ### Notifications Table
  - `idx_notifications_actor_id` - Not used by any queries

  ## Performance Impact
  Removing these indexes will:
  - Reduce disk space usage
  - Improve INSERT, UPDATE, and DELETE performance on these tables
  - Reduce maintenance overhead during VACUUM operations
  - Have no negative impact since these indexes are not being used

  ## Notes
  - All drops use IF EXISTS to prevent errors if indexes were already removed
  - If future queries need these indexes, they can be re-created
*/

-- Remove unused index on comment_replies.parent_reply_id
DROP INDEX IF EXISTS public.idx_comment_replies_parent_reply_id;

-- Remove unused index on properties.start_date
DROP INDEX IF EXISTS public.properties_start_date_idx;

-- Remove unused index on notifications.actor_id
DROP INDEX IF EXISTS public.idx_notifications_actor_id;
