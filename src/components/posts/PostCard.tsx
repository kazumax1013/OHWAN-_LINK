import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Post, Comment, User } from '../../types';
import { ThumbsUp, MessageCircle, MoreHorizontal, FileText, Image, Trash2, Download, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import HeicImage from './HeicImage';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(typeof post.likes === 'number' ? post.likes : (Array.isArray(post.likes) ? post.likes.length : 0));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(Array.isArray(post.comments) ? post.comments : []);
  const [author, setAuthor] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', post.authorId)
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

    const checkLikeStatus = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking like status:', error);
          return;
        }

        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching comments:', error);
          return;
        }

        if (data) {
          const formattedComments = data.map(comment => ({
            id: comment.id,
            content: comment.content,
            authorId: comment.user_id,
            createdAt: comment.created_at,
            likes: [],
          }));
          setComments(formattedComments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchAuthor();
    checkLikeStatus();
    fetchComments();
  }, [post.authorId, post.id, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMenu && !target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  
  const handleLike = async () => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id);

        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq('id', post.id);

        setIsLiked(false);
        setLikesCount(Math.max(0, likesCount - 1));
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: currentUser.id
          });

        await supabase
          .from('posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);

        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };
  
  const handleAddComment = async (newComment: Comment) => {
    setComments([...comments, newComment]);

    await supabase
      .from('posts')
      .update({ comments_count: comments.length + 1 })
      .eq('id', post.id);
  };


  const handleDeleteComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));

    await supabase
      .from('posts')
      .update({ comments_count: Math.max(0, comments.length - 1) })
      .eq('id', post.id);
  };

  const handleDelete = async () => {
    if (!confirm('この投稿を削除してもよろしいですか?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('投稿内容を入力してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      post.content = editContent.trim();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('投稿の更新に失敗しました');
    }
  };
  const getAttachmentIcon = (type: string) => {
    if (type === 'image') {
      return <Image className="h-4 w-4 text-blue-500 mr-1.5" />;
    } else if (type === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500 mr-1.5" />;
    } else if (type === 'excel' || type === 'spreadsheet') {
      return <FileText className="h-4 w-4 text-green-600 mr-1.5" />;
    } else if (type === 'word' || type === 'document') {
      return <FileText className="h-4 w-4 text-blue-600 mr-1.5" />;
    } else if (type === 'powerpoint' || type === 'presentation') {
      return <FileText className="h-4 w-4 text-orange-600 mr-1.5" />;
    } else if (type === 'photoshop' || type === 'psd') {
      return <FileText className="h-4 w-4 text-blue-400 mr-1.5" />;
    } else if (type === 'illustrator' || type === 'ai') {
      return <FileText className="h-4 w-4 text-orange-500 mr-1.5" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-500 mr-1.5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      if (url.startsWith('blob:')) {
        window.open(url, '_blank');
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start">
          <Link to={`/profile/${author?.id}`}>
            <img 
              src={author?.avatarUrl}
              alt={author?.name}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          </Link>
          <div>
            <Link to={`/profile/${author?.id}`} className="font-medium text-gray-900 hover:text-primary-600">
              {author?.name}
            </Link>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja })}</p>
            {post.groupId && (
              <Link to={`/groups/${post.groupId}`} className="text-xs text-primary-600 hover:underline">
                プロジェクトに投稿
              </Link>
            )}
          </div>
        </div>
        {currentUser?.id === post.authorId && (
          <div className="relative menu-container">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-500"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded-t-md"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  編集
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center rounded-b-md"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-800 min-h-[100px]"
              placeholder="投稿内容を入力..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        )}
      </div>

      {/* Images */}
      {post.imageUrls && post.imageUrls.length > 0 ? (
        <div className="px-4 pb-4">
          <div className={`grid gap-2 ${
            post.imageUrls.length === 1 ? 'grid-cols-1' :
            post.imageUrls.length === 2 ? 'grid-cols-2' :
            post.imageUrls.length === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {post.imageUrls.map((url: string, index: number) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden relative group ${
                  post.imageUrls!.length === 1 ? 'aspect-video' : 'aspect-square'
                }`}
              >
                <HeicImage
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDownload(url, `image-${index + 1}.jpg`)}
                  className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="画像をダウンロード"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : post.imageUrl ? (
        <div className="px-4 pb-4">
          <div className="rounded-lg overflow-hidden relative group aspect-video">
            <HeicImage
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDownload(post.imageUrl!, 'image.jpg')}
              className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="画像をダウンロード"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Attachments */}
      {post.attachments.filter(att => att.type !== 'image').length > 0 && (
        <div className="px-4 pb-4">
          <div className={`grid gap-2 ${
            post.attachments.filter(att => att.type !== 'image').length === 1 ? 'grid-cols-1' :
            post.attachments.filter(att => att.type !== 'image').length === 2 ? 'grid-cols-2' :
            post.attachments.filter(att => att.type !== 'image').length === 3 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {post.attachments.filter(att => att.type !== 'image').map(attachment => (
              <div key={attachment.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                {getAttachmentIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                </div>
                <button
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="ml-2 text-gray-500 hover:text-primary-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="ファイルをダウンロード"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div>
          {likesCount > 0 && (
            <span className="flex items-center">
              <ThumbsUp className="h-4 w-4 text-primary-500 mr-1" />
              {likesCount}
            </span>
          )}
        </div>
        <div>
          {comments.length > 0 && (
            <button 
              className="hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {comments.length} 件のコメント
            </button>
          )}
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-2 py-2 border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
        <button 
          className={`flex items-center justify-center py-2 px-2 text-sm font-medium rounded-md transition-colors ${
            isLiked 
              ? 'text-primary-600' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={handleLike}
        >
          <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
          いいね
        </button>
        <button 
          className="flex items-center justify-center py-2 px-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          コメント
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))}
          
          <div className="mt-3">
            <CommentForm postId={post.id} onCommentAdded={handleAddComment} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;