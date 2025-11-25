/*
  # RLSポリシーのパフォーマンス最適化

  1. 最適化対象
    - auth.uid() を (select auth.uid()) に置き換えて、行ごとの再評価を防ぐ
    - 対象テーブル: notifications, follows, messages, attachments, comment_replies

  2. 影響
    - クエリパフォーマンスが大幅に向上
    - スケーラビリティの改善
*/

-- notifications テーブルのRLSポリシーを最適化
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- follows テーブルのRLSポリシーを最適化
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others"
  ON follows
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow"
  ON follows
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = follower_id);

-- messages テーブルのRLSポリシーを最適化
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = sender_id);

-- attachments テーブルのRLSポリシーを最適化
DROP POLICY IF EXISTS "Users can insert attachments" ON attachments;
CREATE POLICY "Users can insert attachments"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = uploaded_by);

DROP POLICY IF EXISTS "Users can delete own attachments" ON attachments;
CREATE POLICY "Users can delete own attachments"
  ON attachments
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = uploaded_by);

-- comment_replies テーブルのRLSポリシーを最適化
DROP POLICY IF EXISTS "Users can create comment replies" ON comment_replies;
CREATE POLICY "Users can create comment replies"
  ON comment_replies
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own comment replies" ON comment_replies;
CREATE POLICY "Users can update own comment replies"
  ON comment_replies
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comment replies" ON comment_replies;
CREATE POLICY "Users can delete own comment replies"
  ON comment_replies
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);