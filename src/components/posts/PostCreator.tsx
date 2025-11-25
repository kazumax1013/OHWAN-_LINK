import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Image, FileText, SendHorizontal, Users, X, Search, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import heic2any from 'heic2any';

interface PostCreatorProps {
  onPostCreated: (post: any) => void;
  groupId?: string;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser?.id || '')
        .or(`name.ilike.%${searchQuery}%,department.ilike.%${searchQuery}%`);

      if (data) setAvailableUsers(data);
    };

    if (showVisibilityModal) {
      fetchUsers();
    }
  }, [searchQuery, currentUser?.id, showVisibilityModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && uploadedFiles.length === 0) return;

    if (!currentUser?.id) {
      alert('ログインが必要です');
      return;
    }

    setIsUploading(true);
    setUploadProgress('アップロード準備中...');

    try {
      const imageUrls: string[] = [];
      const fileUrlMap: Map<string, string> = new Map();

      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i];
          setUploadProgress(`ファイル ${i + 1}/${uploadedFiles.length} をアップロード中...`);

          console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${currentUser.id}/posts/${fileName}`;

          console.log(`Upload path: ${filePath}`);

          const LARGE_FILE_THRESHOLD = 40 * 1024 * 1024;

          try {
            if (file.size > LARGE_FILE_THRESHOLD) {
              console.log('Using Edge Function for large file');
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('認証セッションが見つかりません');
              }

              const formData = new FormData();
              formData.append('file', file);
              formData.append('filePath', filePath);
              formData.append('contentType', file.type || 'application/octet-stream');

              const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-large-file`;

              const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Edge Function error response:', errorText);
                throw new Error(`Edge Function upload failed: ${response.statusText}`);
              }

              const result = await response.json();
              console.log('Edge Function upload success:', result);
            } else {
              console.log('Using direct storage upload');
              const { data, error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false,
                  contentType: file.type || 'application/octet-stream'
                });

              if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw new Error(`Storage upload failed: ${uploadError.message}`);
              }

              console.log('Storage upload success:', data);
            }

            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);

            console.log('Generated public URL:', publicUrl);
            fileUrlMap.set(file.name, publicUrl);

            const fileType = getFileType(file);
            if (fileType === 'image') {
              imageUrls.push(publicUrl);
            }
          } catch (fileError) {
            console.error(`Error uploading file ${file.name}:`, fileError);
            setIsUploading(false);
            setUploadProgress('');
            alert(`ファイル "${file.name}" のアップロードに失敗しました: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
            return;
          }
        }
      }

      setUploadProgress('投稿を作成中...');

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          content,
          image_url: imageUrls[0] || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        setIsUploading(false);
        setUploadProgress('');
        alert(`投稿の作成に失敗しました: ${error.message}`);
        return;
      }

      console.log('Post created successfully:', post);

      const attachmentsData: any[] = [];

      if (post && uploadedFiles.length > 0) {
        setUploadProgress('添付ファイル情報を保存中...');
        const attachmentInserts = uploadedFiles.map((file) => ({
          file_name: file.name,
          file_url: fileUrlMap.get(file.name) || '',
          file_type: file.type,
          file_size: file.size,
          source_type: 'post',
          source_id: post.id,
          uploaded_by: currentUser.id
        }));

        const { data: insertedAttachments, error: attachmentError } = await supabase
          .from('attachments')
          .insert(attachmentInserts)
          .select();

        if (attachmentError) {
          console.error('Error saving attachments:', attachmentError);
        } else if (insertedAttachments) {
          attachmentsData.push(...insertedAttachments.map((att: any) => {
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
          }));
        }
      }

      if (post) {
        onPostCreated({
          id: post.id,
          content: post.content,
          authorId: post.user_id,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          imageUrl: post.image_url,
          imageUrls: post.image_urls || [],
          attachments: attachmentsData,
          likes: [],
          comments: [],
        });
      }

      setContent('');
      setAttachments([]);
      setUploadedFiles([]);
      setIsExpanded(false);
      setSelectedUsers([]);
      setIsUploading(false);
      setUploadProgress('');
    } catch (error) {
      console.error('Error submitting post:', error);
      setIsUploading(false);
      setUploadProgress('');
      alert(`投稿の送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') ||
               fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return 'excel';
    } else if (mimeType.includes('word') || mimeType.includes('document') ||
               fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'word';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') ||
               fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return 'powerpoint';
    } else if (fileName.endsWith('.psd')) {
      return 'psd';
    } else if (fileName.endsWith('.ai')) {
      return 'ai';
    } else {
      return 'document';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    const index = attachments.findIndex(att => att.id === attachmentId);
    if (index !== -1) {
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const fileName = file.name.toLowerCase();
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');

    if (!isHeic) {
      return file;
    }

    try {
      console.log('Converting HEIC to JPEG:', file.name);
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });

      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
      const convertedFile = new File([blob], newFileName, { type: 'image/jpeg' });

      console.log('HEIC conversion successful:', newFileName);
      return convertedFile;
    } catch (error) {
      console.error('Error converting HEIC to JPEG:', error);
      alert('HEIC画像の変換に失敗しました。別の形式の画像をお試しください。');
      throw error;
    }
  };

  const processFiles = async (files: File[]) => {
    const MAX_FILES = 4;
    const currentFileCount = attachments.length;
    const availableSlots = MAX_FILES - currentFileCount;

    if (availableSlots <= 0) {
      alert(`最大${MAX_FILES}つまでのファイルを添付できます`);
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`最大${MAX_FILES}つまでのファイルを添付できます。${filesToAdd.length}個のファイルを追加しました。`);
    }

    // Convert HEIC files to JPEG
    const convertedFiles: File[] = [];
    for (const file of filesToAdd) {
      try {
        const convertedFile = await convertHeicToJpeg(file);
        convertedFiles.push(convertedFile);
      } catch (error) {
        console.error('Failed to convert file:', file.name);
      }
    }

    const newAttachments = convertedFiles.map(file => {
      const fileType = getFileType(file);
      return {
        id: `temp-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: fileType,
        url: fileType === 'image'
          ? URL.createObjectURL(file)
          : '#',
        size: file.size,
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
    setUploadedFiles(prev => [...prev, ...convertedFiles]);
    setIsExpanded(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start">
        <img 
          src={currentUser?.avatarUrl}
          alt={currentUser?.name}
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        
        <div className="flex-1">
          <div
            onClick={() => setIsExpanded(true)}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 transition-all ${
              isExpanded ? 'hidden' : 'block cursor-text bg-gray-50'
            }`}
          >
            <span className="text-gray-500">今、何を考えていますか？</span>
          </div>
          
          {isExpanded && (
            <form onSubmit={handleSubmit}>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative transition-all ${
                  isDragging ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="今、何を考えていますか？"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px] resize-none text-gray-800"
                  autoFocus
                />
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary-50 bg-opacity-90 rounded-lg border-2 border-dashed border-primary-500 pointer-events-none">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                      <p className="text-primary-700 font-medium">ファイルをドロップ</p>
                    </div>
                  </div>
                )}
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">
                      添付ファイル {attachments.length}/4
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="relative group">
                        {attachment.type === 'image' ? (
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeAttachment(attachment.id)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs text-white truncate">{attachment.name}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:bg-gray-100 transition-colors">
                            <FileText className="h-8 w-8 text-blue-500 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate font-medium">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                              onClick={() => removeAttachment(attachment.id)}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">{uploadProgress}</p>
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`flex items-center text-gray-500 hover:text-primary-600 transition-colors ${
                      attachments.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleFileUpload}
                    disabled={attachments.length >= 4}
                  >
                    <Image className="h-5 w-5 mr-1" />
                    <span className="text-sm">写真</span>
                  </button>
                  <button
                    type="button"
                    className={`flex items-center text-gray-500 hover:text-primary-600 transition-colors ${
                      attachments.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleFileUpload}
                    disabled={attachments.length >= 4}
                  >
                    <FileText className="h-5 w-5 mr-1" />
                    <span className="text-sm">ファイル</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.ai,.psd,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    multiple
                  />
                  <button
                    type="button"
                    className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                    onClick={() => setShowVisibilityModal(true)}
                  >
                    <Users className="h-5 w-5 mr-1" />
                    <span className="text-sm">
                      {selectedUsers.length > 0 
                        ? `${selectedUsers.length}人が閲覧可能` 
                        : '全員に公開'}
                    </span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent('');
                      setAttachments([]);
                      setUploadedFiles([]);
                      setSelectedUsers([]);
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!content.trim() && uploadedFiles.length === 0) || isUploading}
                  >
                    <SendHorizontal className="h-4 w-4 mr-1" />
                    {isUploading ? 'アップロード中...' : '投稿'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Visibility Modal */}
      {showVisibilityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">閲覧できるメンバーを選択</h2>
              <button 
                onClick={() => setShowVisibilityModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="メンバーを検索..."
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {availableUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedUsers.includes(user.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowVisibilityModal(false)}
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  完了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreator;