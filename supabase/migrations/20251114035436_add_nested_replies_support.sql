/*
  # ネストされた返信のサポート追加

  1. 変更内容
    - `comment_replies`テーブルに`parent_reply_id`カラムを追加
    - 返信に対してさらに返信できるようにする（ネストされた返信）
    - parent_reply_idがNULLの場合はコメントへの直接返信
    - parent_reply_idが設定されている場合は返信への返信

  2. セキュリティ
    - 既存のRLSポリシーはそのまま適用される
*/

-- parent_reply_idカラムを追加（既存の場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comment_replies' AND column_name = 'parent_reply_id'
  ) THEN
    ALTER TABLE comment_replies 
    ADD COLUMN parent_reply_id uuid REFERENCES comment_replies(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_comment_replies_parent_reply_id 
    ON comment_replies(parent_reply_id);
  END IF;
END $$;