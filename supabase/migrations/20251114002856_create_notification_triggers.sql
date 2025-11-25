/*
  # 通知トリガーの作成

  1. 機能
    - いいねされた時に通知を作成
    - コメントされた時に通知を作成
    - コメントに返信された時に通知を作成
    - フォローされた時に通知を作成

  2. トリガー関数
    - notify_on_like: いいね通知
    - notify_on_comment: コメント通知
    - notify_on_reply: 返信通知
    - notify_on_follow: フォロー通知

  3. 重複通知の防止
    - 自分自身へのアクションでは通知を作成しない
*/

-- いいね通知の作成
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  post_content text;
  liker_name text;
BEGIN
  -- 投稿の作成者を取得
  SELECT user_id, LEFT(content, 50) INTO post_author_id, post_content
  FROM posts WHERE id = NEW.post_id;

  -- いいねしたユーザーの名前を取得
  SELECT name INTO liker_name FROM profiles WHERE id = NEW.user_id;

  -- 自分自身へのいいねでは通知しない
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, action_url, actor_id)
    VALUES (
      post_author_id,
      'like',
      'いいねされました',
      liker_name || 'さんがあなたの投稿にいいねしました',
      '/timeline',
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- コメント通知の作成
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  -- 投稿の作成者を取得
  SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;

  -- コメントしたユーザーの名前を取得
  SELECT name INTO commenter_name FROM profiles WHERE id = NEW.user_id;

  -- 自分自身へのコメントでは通知しない
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, action_url, actor_id)
    VALUES (
      post_author_id,
      'comment',
      'コメントされました',
      commenter_name || 'さんがあなたの投稿にコメントしました',
      '/timeline',
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 返信通知の作成
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  comment_author_id uuid;
  replier_name text;
BEGIN
  -- コメントの作成者を取得
  SELECT user_id INTO comment_author_id FROM comments WHERE id = NEW.comment_id;

  -- 返信したユーザーの名前を取得
  SELECT name INTO replier_name FROM profiles WHERE id = NEW.user_id;

  -- 自分自身への返信では通知しない
  IF comment_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, action_url, actor_id)
    VALUES (
      comment_author_id,
      'reply',
      '返信されました',
      replier_name || 'さんがあなたのコメントに返信しました',
      '/timeline',
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- フォロー通知の作成
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_name text;
BEGIN
  -- フォローしたユーザーの名前を取得
  SELECT name INTO follower_name FROM profiles WHERE id = NEW.follower_id;

  INSERT INTO notifications (user_id, type, title, message, action_url, actor_id)
  VALUES (
    NEW.following_id,
    'follow',
    'フォローされました',
    follower_name || 'さんがあなたをフォローしました',
    '/members',
    NEW.follower_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS trigger_notify_on_like ON post_likes;
CREATE TRIGGER trigger_notify_on_like
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

DROP TRIGGER IF EXISTS trigger_notify_on_reply ON comment_replies;
CREATE TRIGGER trigger_notify_on_reply
  AFTER INSERT ON comment_replies
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_reply();

DROP TRIGGER IF EXISTS trigger_notify_on_follow ON follows;
CREATE TRIGGER trigger_notify_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();