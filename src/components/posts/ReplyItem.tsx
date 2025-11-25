import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { User } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ReplyForm from './ReplyForm';

interface Reply {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likes: string[];
  commentId: string;
  parentReplyId?: string | null;
}

interface ReplyItemProps {
  reply: Reply;
  onDelete?: (replyId: string) => void;
  onReplyAdded?: (reply: Reply) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onDelete, onReplyAdded }) => {
  const { currentUser } = useAuth();
  const [author, setAuthor] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<Reply[]>([]);

  const isOwner = currentUser?.id === reply.authorId;

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', reply.authorId)
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

    const fetchNestedReplies = async () => {
      try {
        const { data, error } = await supabase
          .from('comment_replies')
          .select('*')
          .eq('parent_reply_id', reply.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching nested replies:', error);
          return;
        }

        if (data) {
          const formattedReplies = data.map(r => ({
            id: r.id,
            content: r.content,
            authorId: r.user_id,
            createdAt: r.created_at,
            likes: [],
            commentId: r.comment_id,
            parentReplyId: r.parent_reply_id,
          }));
          setNestedReplies(formattedReplies);
        }
      } catch (error) {
        console.error('Error fetching nested replies:', error);
      }
    };

    fetchAuthor();
    fetchNestedReplies();
  }, [reply.authorId, reply.id]);

  const handleDelete = async () => {
    if (!window.confirm('この返信を削除してもよろしいですか?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comment_replies')
        .delete()
        .eq('id', reply.id);

      if (error) {
        console.error('Error deleting reply:', error);
        alert('返信の削除に失敗しました');
        return;
      }

      if (onDelete) {
        onDelete(reply.id);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('返信の削除に失敗しました');
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('返信内容を入力してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('comment_replies')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reply.id);

      if (error) throw error;

      reply.content = editContent.trim();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating reply:', error);
      alert('返信の更新に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(reply.content);
  };

  const handleNestedReply = (newReply: Reply) => {
    setNestedReplies(prev => [...prev, newReply]);
    setShowReplyForm(false);
    if (onReplyAdded) {
      onReplyAdded(newReply);
    }
  };

  const handleDeleteNestedReply = (replyId: string) => {
    setNestedReplies(prev => prev.filter(r => r.id !== replyId));
  };

  return (
    <div className="flex mt-3 animate-fade-in first:mt-0 ml-8">
      <Link to={`/profile/${author?.id}`} className="flex-shrink-0 mr-2">
        <img
          src={author?.avatarUrl}
          alt={author?.name}
          className="h-6 w-6 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <Link to={`/profile/${author?.id}`} className="font-medium text-gray-900 hover:text-primary-600 text-xs">
            {author?.name}
          </Link>
          {isEditing ? (
            <div className="mt-1 space-y-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex justify-end gap-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-xs mt-0.5">{reply.content}</p>
          )}
        </div>
        <div className="flex items-center mt-1 text-xs">
          <button
            className="font-medium text-gray-500 hover:text-gray-700 mr-3"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            返信
          </button>
          <span className="text-gray-500">
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ja })}
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
        </div>

        {showReplyForm && (
          <div className="mt-2 ml-2">
            <ReplyForm
              commentId={reply.commentId}
              parentReplyId={reply.id}
              onReplyAdded={handleNestedReply}
              placeholder={`${author?.name}さんに返信...`}
            />
          </div>
        )}

        {nestedReplies.length > 0 && (
          <div className="mt-2">
            {nestedReplies.map(nestedReply => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                onDelete={handleDeleteNestedReply}
                onReplyAdded={onReplyAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;
