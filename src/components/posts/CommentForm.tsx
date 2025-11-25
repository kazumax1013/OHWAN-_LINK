import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SendHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: any) => void;
  placeholder?: string;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  onCommentAdded,
  placeholder = "コメントを入力...",
  isReply = false
}) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser?.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        alert('コメントの投稿に失敗しました');
        return;
      }

      const newComment = {
        id: data.id,
        content: data.content,
        authorId: data.user_id,
        createdAt: data.created_at,
        likes: [],
      };

      onCommentAdded(newComment);
      setContent('');
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('コメントの投稿に失敗しました');
    }
  };

  return (
    <div className="flex items-start animate-fade-in">
      <img 
        src={currentUser?.avatarUrl}
        alt={currentUser?.name}
        className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} rounded-full object-cover mr-2 flex-shrink-0`}
      />
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border border-gray-300 rounded-full px-4 pr-9 focus:ring-primary-500 focus:border-primary-500 text-gray-800 ${
            isReply ? 'py-1 text-xs' : 'py-1.5 text-sm'
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 focus:outline-none"
          disabled={!content.trim()}
        >
          <SendHorizontal className={`${isReply ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </button>
      </form>
    </div>
  );
};

export default CommentForm;