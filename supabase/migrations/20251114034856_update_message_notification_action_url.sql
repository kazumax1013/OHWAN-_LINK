/*
  # メッセージ通知のアクションURL更新

  1. 変更内容
    - メッセージ通知のaction_urlを特定のチャットページに遷移するように変更
    - グループメッセージ: /messages?groupId={group_id}
    - ダイレクトメッセージ: /messages?userId={sender_id}

  2. セキュリティ
    - SECURITY DEFINERで実行
    - search_pathを明示的に設定
*/

-- メッセージ通知の作成関数を更新
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  sender_name text;
  recipient_user_id uuid;
  group_name text;
  member_record RECORD;
BEGIN
  -- 送信者の名前を取得
  SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- グループメッセージの場合
  IF NEW.group_id IS NOT NULL THEN
    -- グループ名を取得
    SELECT name INTO group_name FROM public.groups WHERE id = NEW.group_id;
    
    -- グループの全メンバーに通知（送信者自身を除く）
    FOR member_record IN 
      SELECT user_id 
      FROM public.group_members 
      WHERE group_id = NEW.group_id 
      AND user_id != NEW.sender_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
      VALUES (
        member_record.user_id,
        'message',
        '新しいメッセージ',
        sender_name || 'さんが' || group_name || 'にメッセージを送信しました',
        '/messages?groupId=' || NEW.group_id,
        NEW.sender_id
      );
    END LOOP;
  
  -- ダイレクトメッセージの場合
  ELSIF NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, actor_id)
    VALUES (
      NEW.recipient_id,
      'message',
      '新しいメッセージ',
      sender_name || 'さんからメッセージが届きました',
      '/messages?userId=' || NEW.sender_id,
      NEW.sender_id
    );
  END IF;

  RETURN NEW;
END;
$$;