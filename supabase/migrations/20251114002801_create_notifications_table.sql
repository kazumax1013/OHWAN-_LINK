/*
  # 通知テーブルの作成

  1. 新しいテーブル
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - 通知を受け取るユーザー
      - `type` (text) - 通知タイプ（like, comment, follow, message, etc.）
      - `title` (text) - 通知タイトル
      - `message` (text) - 通知メッセージ
      - `action_url` (text) - クリック時の遷移先URL（オプション）
      - `actor_id` (uuid) - アクションを起こしたユーザー（オプション）
      - `is_read` (boolean) - 既読フラグ
      - `created_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分の通知のみ表示・更新可能
    - 認証済みユーザーのみ通知を作成可能

  3. インデックス
    - user_idとcreated_atの複合インデックス（効率的な取得用）
    - is_readのインデックス（未読カウント用）
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'follow', 'message', 'mention', 'system')),
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  action_url text,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の通知のみ表示可能
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ユーザーは自分の通知のみ更新可能（既読マーク用）
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 認証済みユーザーは通知を作成可能
CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ユーザーは自分の通知のみ削除可能
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
  ON notifications(user_id, is_read) WHERE is_read = false;