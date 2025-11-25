import React, { useState, useEffect } from 'react';
import PostCard from '../components/posts/PostCard';
import PostCreator from '../components/posts/PostCreator';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Timeline: React.FC = () => {
  const { currentUser } = useAuth();
  const [timelinePosts, setTimelinePosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          image_urls,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          profiles:user_id (
            id,
            name,
            avatar_url,
            department,
            position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        const postsWithAttachments = await Promise.all(
          data.map(async (post: any) => {
            const { data: attachments, error: attachmentsError } = await supabase
              .from('attachments')
              .select('*')
              .eq('source_type', 'post')
              .eq('source_id', post.id)
              .order('created_at', { ascending: true });

            if (attachmentsError) {
              console.error('Error fetching attachments:', attachmentsError);
            }

            // Ensure image_urls is properly formatted as an array
            let imageUrlsArray: string[] = [];
            if (post.image_urls) {
              if (Array.isArray(post.image_urls)) {
                imageUrlsArray = post.image_urls;
              } else if (typeof post.image_urls === 'string') {
                // If it's a string, try to parse it as JSON
                try {
                  imageUrlsArray = JSON.parse(post.image_urls);
                } catch {
                  imageUrlsArray = [post.image_urls];
                }
              }
            }


            const postData = {
              id: post.id,
              content: post.content,
              authorId: post.user_id,
              createdAt: post.created_at,
              updatedAt: post.updated_at,
              imageUrl: post.image_url,
              imageUrls: imageUrlsArray,
              attachments: attachments?.map((att: any) => {
                let fileType = 'file';
                if (att.file_type.startsWith('image/')) {
                  fileType = 'image';
                } else if (att.file_type.includes('pdf')) {
                  fileType = 'pdf';
                } else if (att.file_type.includes('excel') || att.file_type.includes('spreadsheet') ||
                           att.file_name.endsWith('.xls') || att.file_name.endsWith('.xlsx')) {
                  fileType = 'excel';
                } else if (att.file_type.includes('word') || att.file_type.includes('document') ||
                           att.file_name.endsWith('.doc') || att.file_name.endsWith('.docx')) {
                  fileType = 'word';
                } else if (att.file_type.includes('presentation') || att.file_type.includes('powerpoint') ||
                           att.file_name.endsWith('.ppt') || att.file_name.endsWith('.pptx')) {
                  fileType = 'powerpoint';
                } else if (att.file_name.endsWith('.psd')) {
                  fileType = 'psd';
                } else if (att.file_name.endsWith('.ai')) {
                  fileType = 'ai';
                }
                return {
                  id: att.id,
                  name: att.file_name,
                  type: fileType,
                  size: att.file_size,
                  url: att.file_url
                };
              }) || [],
              likes: [],
              comments: [],
            };

            return postData;
          })
        );
        setTimelinePosts(postsWithAttachments);
      }
      setIsLoading(false);
    };

    if (currentUser) {
      fetchPosts();
    }
  }, [currentUser]);

  const handleNewPost = (newPost: any) => {
    setTimelinePosts([newPost, ...timelinePosts]);
  };

  const handleDeletePost = (postId: string) => {
    setTimelinePosts(timelinePosts.filter(post => post.id !== postId));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">タイムライン</h1>
      
      <div className="mb-6">
        <PostCreator onPostCreated={handleNewPost} />
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : timelinePosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">投稿がありません</div>
        ) : (
          timelinePosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;