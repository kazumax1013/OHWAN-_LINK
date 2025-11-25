import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SendHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReplyFormProps {
  commentId: string;
  parentReplyId?: string | null;
  onReplyAdded: (reply: any) => void;
  placeholder?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  commentId,
  parentReplyId = null,
  onReplyAdded,
  placeholder = "返信を入力...",
}) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      const insertData: any = {
        comment_id: commentId,
        user_id: currentUser?.id,
        content: content.trim(),
      };

      if (parentReplyId) {
        insertData.parent_reply_id = parentReplyId;
      }

      const { data, error } = await supabase
        .from('comment_replies')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating reply:', error);
        alert('返信の投稿に失敗しました');
        return;
      }

      const newReply = {
        id: data.id,
        content: data.content,
        authorId: data.user_id,
        createdAt: data.created_at,
        likes: [],
        commentId: data.comment_id,
        parentReplyId: data.parent_reply_id,
      };

      onReplyAdded(newReply);
      setContent('');
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('返信の投稿に失敗しました');
    }
  };

  return (
    <div className="flex items-start animate-fade-in">
      <img
        src={currentUser?.avatarUrl}
        alt={currentUser?.name}
        className="h-6 w-6 rounded-full object-cover mr-2 flex-shrink-0"
      />
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-full px-4 pr-9 focus:ring-primary-500 focus:border-primary-500 text-gray-800 py-1 text-xs"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 focus:outline-none"
          disabled={!content.trim()}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ReplyForm;
