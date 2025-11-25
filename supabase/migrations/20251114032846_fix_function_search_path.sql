/*
  # 関数のサーチパス脆弱性の修正

  1. 問題
    - 通知トリガー関数がrole mutableなsearch_pathを持っている
    - セキュリティリスクとなる可能性がある

  2. 修正内容
    - 関数を再作成し、SECURITYオプションとSEARCH_PATHを明示的に設定
    - スキーマを完全修飾形式で参照
*/

-- いいね通知の作成（セキュリティ強化版）
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  post_author_id uuid;
  post_content text;
  liker_name text;
BEGIN
  -- 投稿の作成者を取得
  SELECT user_id, LEFT(content, 50) INTO post_author_id, post_content
  FROM public.posts WHERE id = NEW.post_id;

  -- いいねしたユーザーの名前を取得
  SELECT name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;

  -- 自分自身へのいいねでは通知しない
  IF post_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
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
$$;

-- コメント通知の作成（セキュリティ強化版）
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  -- 投稿の作成者を取得
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;

  -- コメントしたユーザーの名前を取得
  SELECT name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;

  -- 自分自身へのコメントでは通知しない
  IF post_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
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
$$;

-- 返信通知の作成（セキュリティ強化版）
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  comment_author_id uuid;
  replier_name text;
BEGIN
  -- コメントの作成者を取得
  SELECT user_id INTO comment_author_id FROM public.comments WHERE id = NEW.comment_id;

  -- 返信したユーザーの名前を取得
  SELECT name INTO replier_name FROM public.profiles WHERE id = NEW.user_id;

  -- 自分自身への返信では通知しない
  IF comment_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
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
$$;

-- フォロー通知の作成（セキュリティ強化版）
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  follower_name text;
BEGIN
  -- フォローしたユーザーの名前を取得
  SELECT name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
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
$$;