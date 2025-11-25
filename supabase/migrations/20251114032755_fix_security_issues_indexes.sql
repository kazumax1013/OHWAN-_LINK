/*
  # セキュリティとパフォーマンスの修正 - インデックス

  1. 外部キーインデックスの追加
    - notifications.actor_id にインデックスを追加

  2. 未使用インデックスの削除
    - パフォーマンスへの影響がないため削除
*/

-- 外部キーインデックスの追加
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
  ON notifications(actor_id) WHERE actor_id IS NOT NULL;

-- 未使用インデックスの削除
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_groups_created_by;
DROP INDEX IF EXISTS idx_messages_group_id;
DROP INDEX IF EXISTS idx_poll_options_poll_id;
DROP INDEX IF EXISTS idx_poll_votes_option_id;
DROP INDEX IF EXISTS idx_poll_votes_user_id;
DROP INDEX IF EXISTS idx_polls_created_by;
DROP INDEX IF EXISTS idx_post_likes_user_id;
DROP INDEX IF EXISTS idx_properties_created_by;
DROP INDEX IF EXISTS profiles_is_online_idx;
DROP INDEX IF EXISTS follows_created_at_idx;
DROP INDEX IF EXISTS attachments_source_type_id_idx;
DROP INDEX IF EXISTS attachments_uploaded_by_idx;
DROP INDEX IF EXISTS idx_comment_replies_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;