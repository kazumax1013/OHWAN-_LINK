import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Comment, User } from '../../types';
import { ThumbsUp, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReplyForm from './ReplyForm';
import ReplyItem from './ReplyItem';
import { supabase } from '../../lib/supabase';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, isReply = false }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.likes.includes(currentUser?.id || ''));
  const [likesCount, setLikesCount] = useState(comment.likes.length);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = currentUser?.id === comment.authorId;

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', comment.authorId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching author:', error);
          return;
        }

        if (data) {
          setAuthor({
            id: data.id,
            name: data.name,
            email: data.email,
            department: data.department,
            position: data.position,
            avatarUrl: data.avatar_url,
            skills: data.skills,
            interests: data.interests,
            joinedAt: data.joined_at,
            role: data.role,
          });
        }
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    };

    const fetchReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('comment_replies')
          .select('*')
          .eq('comment_id', comment.id)
          .is('parent_reply_id', null)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching replies:', error);
          return;
        }

        if (data) {
          const formattedReplies = data.map(reply => ({
            id: reply.id,
            content: reply.content,
            authorId: reply.user_id,
            createdAt: reply.created_at,
            likes: [],
            commentId: reply.comment_id,
            parentReplyId: reply.parent_reply_id,
          }));
          setReplies(formattedReplies);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    };

    fetchAuthor();
    fetchReplies();
  }, [comment.authorId, comment.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleDelete = async () => {
    if (!window.confirm('このコメントを削除してもよろしいですか?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) {
        console.error('Error deleting comment:', error);
        alert('コメントの削除に失敗しました');
        return;
      }

      if (onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const handleReply = (reply: any) => {
    setReplies(prev => [...prev, reply]);
    setShowReplyForm(false);
  };

  const handleDeleteReply = (replyId: string) => {
    setReplies(prev => prev.filter(r => r.id !== replyId));
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('コメント内容を入力してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', comment.id);

      if (error) throw error;

      comment.content = editContent.trim();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('コメントの更新に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };
  return (
    <div className={`flex mt-3 animate-fade-in first:mt-0 ${isReply ? 'ml-8' : ''}`}>
      <Link to={`/profile/${author?.id}`} className="flex-shrink-0 mr-2">
        <img 
          src={author?.avatarUrl}
          alt={author?.name}
          className="h-8 w-8 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg p-2.5 shadow-sm">
          <Link to={`/profile/${author?.id}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">
            {author?.name}
          </Link>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 min-h-[60px]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm mt-0.5">{comment.content}</p>
          )}
        </div>
        <div className="flex items-center mt-1 text-xs">
          <button 
            className={`font-medium mr-3 ${isLiked ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={handleLike}
          >
            いいね
          </button>
          {!isReply && (
            <button 
              className="font-medium text-gray-500 hover:text-gray-700 mr-3"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
            返信
            </button>
          )}
          <span className="text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ja })}
          </span>
          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-3 font-medium text-gray-500 hover:text-gray-700 flex items-center"
                title="編集"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                編集
              </button>
              <button
                onClick={handleDelete}
                className="ml-3 font-medium text-red-500 hover:text-red-700 flex items-center"
                title="削除"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                削除
              </button>
            </>
          )}
          {likesCount > 0 && (
            <div className="ml-auto flex items-center text-xs text-gray-500">
              <ThumbsUp className="h-3 w-3 text-primary-500 mr-1" />
              {likesCount}
            </div>
          )}
        </div>
        
        {/* Reply Form */}
        {showReplyForm && !isReply && (
          <div className="mt-2 ml-2">
            <ReplyForm
              commentId={comment.id}
              onReplyAdded={handleReply}
              placeholder={`${author?.name}さんに返信...`}
            />
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && !isReply && (
          <div className="mt-2">
            {replies.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onDelete={handleDeleteReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;