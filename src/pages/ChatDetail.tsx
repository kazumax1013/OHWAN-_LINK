import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Search,
  Info,
  Paperclip,
  Image,
  SendHorizontal,
  X,
  Trash2,
  FileText,
  Download
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  group_id: string | null;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string;
  };
  attachments?: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[];
}

const getContentType = (file: File): string => {
  if (file.type) {
    return file.type;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'ai': 'application/postscript',
    'psd': 'image/vnd.adobe.photoshop',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
};

const ChatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id && currentUser) {
      const initChat = async () => {
        await fetchOtherUser();
        await fetchMessages();
        setIsLoading(false);
      };

      initChat();

      const channel = supabase
        .channel(`chat-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, currentUser]);

  const fetchOtherUser = async () => {
    if (!id || !currentUser) return;

    console.log('Chat ID:', id);
    console.log('Current User ID:', currentUser.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, position')
      .eq('id', id)
      .maybeSingle();

    console.log('Fetched other user:', data);
    console.log('Fetch error:', error);

    if (!error && data) {
      setOtherUser(data);
    } else {
      console.error('Failed to fetch other user:', error);
    }
  };

  const fetchMessages = async () => {
    if (!id || !currentUser) {
      console.log('fetchMessages: Missing id or currentUser', { id, currentUser: !!currentUser });
      return;
    }

    console.log('Fetching messages between:', currentUser.id, 'and', id);

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Messages query error:', messagesError);
        throw messagesError;
      }

      console.log('Fetched messages count:', messagesData?.length || 0);
      console.log('Messages data:', messagesData);

      const messageIds = messagesData?.map(m => m.id) || [];

      let attachmentsData: any[] = [];
      if (messageIds.length > 0) {
        const { data: attachData, error: attachError } = await supabase
          .from('attachments')
          .select('*')
          .in('source_id', messageIds)
          .eq('source_type', 'message');

        if (attachError) {
          console.error('Attachments query error:', attachError);
        } else {
          attachmentsData = attachData || [];
        }
      }

      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      let profilesData: any[] = [];

      if (senderIds.length > 0) {
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', senderIds);

        if (profError) {
          console.error('Profiles query error:', profError);
        } else {
          profilesData = profData || [];
        }
      }

      const profileMap = new Map(profilesData.map(p => [p.id, p]));
      const attachmentsMap = new Map<string, any[]>();

      attachmentsData.forEach(att => {
        if (!attachmentsMap.has(att.source_id)) {
          attachmentsMap.set(att.source_id, []);
        }
        attachmentsMap.get(att.source_id)?.push(att);
      });

      const messages = (messagesData || []).map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id),
        attachments: attachmentsMap.get(msg.id) || []
      }));

      console.log('Processed messages:', messages);
      setChatMessages(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      alert('メッセージの取得に失敗しました。ページを再読み込みしてください。');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    const RECOMMENDED_MAX_SIZE = 100 * 1024 * 1024;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    const largeFiles: string[] = [];

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else if (file.size > RECOMMENDED_MAX_SIZE) {
        largeFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        validFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`以下のファイルはサイズが大きすぎます（最大500MB）:\n${invalidFiles.join('\n')}`);
    }

    if (largeFiles.length > 0) {
      const proceed = confirm(`以下のファイルは100MBを超えています。アップロードに時間がかかる場合があります：\n${largeFiles.join('\n')}\n\n続行しますか？`);
      if (!proceed) {
        return;
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    const newAttachments = validFiles.map(file => {
      const fileType = file.type.includes('image') ? 'image' : 'document';
      const contentType = getContentType(file);
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        detectedType: fileType,
        contentType: contentType
      });
      return {
        id: `attachment-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: fileType,
        url: fileType === 'image' ? URL.createObjectURL(file) : '#',
        size: file.size,
        file: file
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('このチャットを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      await fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('チャットの削除に失敗しました');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentUser || !id) return;

    console.log('Sending message from', currentUser.id, 'to', id);
    console.log('Current user object:', currentUser);
    console.log('Recipient ID:', id);

    try {
      setUploadingImage(true);
      let imageUrl: string | null = null;
      const uploadedFiles: any[] = [];

      if (attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.file) {
            const file = attachment.file;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const folderName = attachment.type === 'image' ? 'message-images' : 'message-documents';
            const filePath = `${currentUser.id}/${folderName}/${fileName}`;

            const contentType = getContentType(file);
            console.log('Uploading file:', {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              filePath: filePath,
              bucket: 'attachments',
              contentType: contentType,
              attachmentType: attachment.type
            });

            let uploadData, uploadError;
            const LARGE_FILE_THRESHOLD = 40 * 1024 * 1024;

            if (file.size > LARGE_FILE_THRESHOLD) {
              console.log(`Using Edge Function for large file upload (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                throw new Error('認証セッションが見つかりません');
              }

              const formData = new FormData();
              formData.append('file', file);
              formData.append('filePath', filePath);
              formData.append('contentType', contentType);

              const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-large-file`;

              const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(`Edge Function upload failed: ${errorData.error || response.statusText}`);
              }

              const result = await response.json();
              if (!result.success) {
                throw new Error(result.error || 'Upload failed');
              }

              uploadData = { path: result.path };
              uploadError = null;
            } else {
              const maxRetries = 3;
              let retryCount = 0;

              while (retryCount < maxRetries) {
                const result = await supabase.storage
                  .from('attachments')
                  .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: contentType
                  });

                uploadData = result.data;
                uploadError = result.error;

                if (!uploadError) break;

                retryCount++;
                if (retryCount < maxRetries) {
                  console.log(`Upload failed, retrying (${retryCount}/${maxRetries})...`);
                  await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                }
              }

              if (uploadError) {
                console.error('Upload error:', uploadError);
                console.error('Upload error details:', {
                  message: uploadError.message,
                  statusCode: (uploadError as any).statusCode,
                  error: uploadError
                });
                throw new Error(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
              }

              console.log('Upload successful:', uploadData);
            }

            console.log('File uploaded successfully:', filePath);

            const { data: { publicUrl } } = supabase.storage
              .from('attachments')
              .getPublicUrl(filePath);

            console.log('Public URL generated:', publicUrl);

            if (attachment.type === 'image' && !imageUrl) {
              imageUrl = publicUrl;
            }

            uploadedFiles.push({
              file,
              url: publicUrl
            });
          }
        }
      }

      console.log('Inserting message:', {
        sender_id: currentUser.id,
        recipient_id: id,
        content_length: newMessage.length,
        has_image: !!imageUrl,
        attachments_count: uploadedFiles.length
      });

      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: id,
          content: newMessage || '',
          image_url: imageUrl,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        alert(`メッセージの送信に失敗しました: ${error.message}`);
        throw error;
      }

      if (uploadedFiles.length > 0 && messageData) {
        const attachmentRecords = uploadedFiles.map(({ file, url }) => ({
          file_name: file.name,
          file_url: url,
          file_type: getContentType(file),
          file_size: file.size,
          source_type: 'message',
          source_id: messageData.id,
          uploaded_by: currentUser.id
        }));

        console.log('Inserting attachment records:', attachmentRecords);

        const { error: attachError } = await supabase
          .from('attachments')
          .insert(attachmentRecords);

        if (attachError) {
          console.error('Attachment insert error:', attachError);
          console.error('Failed attachment records:', attachmentRecords);
          throw new Error(`添付ファイルの保存に失敗しました: ${attachError.message}`);
        }

        console.log('Attachments saved successfully');
      }

      console.log('Message sent successfully, clearing form');
      setNewMessage('');
      setAttachments([]);
      setUploadingImage(false);

      await fetchMessages();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error?.message || 'チャットの送信に失敗しました';
      alert(`エラー: ${errorMessage}`);
      setUploadingImage(false);
    }
  };

  if (!id || !currentUser) {
    return <Navigate to="/messages/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full relative">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={otherUser?.avatar_url || ''}
                alt={otherUser?.name || ''}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {otherUser?.name || '不明なユーザー'}
              </h2>
              <p className="text-sm text-gray-600">
                {otherUser?.position || ''}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <button className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-white/80 transition-all">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-white/80 transition-all">
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-6 max-w-4xl mx-auto">
            {chatMessages.map((message, index) => {
              const isCurrentUser = message.sender_id === currentUser?.id;
              const sender = message.sender;
              const prevMessage = index > 0 ? chatMessages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar && !isCurrentUser ? 'ml-10' : ''} ${!showAvatar && isCurrentUser ? 'mr-10' : ''}`}
                >
                  {!isCurrentUser && showAvatar && sender && (
                    <img
                      src={sender.avatar_url}
                      alt={sender.name}
                      className="h-8 w-8 rounded-full object-cover shadow-sm flex-shrink-0"
                    />
                  )}
                  {!isCurrentUser && !showAvatar && (
                    <div className="h-8 w-8 flex-shrink-0" />
                  )}
                  <div className="flex flex-col max-w-[65%] group/message">
                    {!isCurrentUser && showAvatar && sender && (
                      <span className="text-xs font-medium text-gray-600 mb-1 ml-1">{sender.name}</span>
                    )}
                    <div className="flex items-start gap-2">
                      <div
                        className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                          isCurrentUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                        }`}
                      >
                        {message.image_url && (
                          <img
                            src={message.image_url}
                            alt="Attached image"
                            className="rounded-lg mb-2 max-w-full h-auto max-h-64 object-cover"
                          />
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {message.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                  isCurrentUser
                                    ? 'bg-white/20 hover:bg-white/30'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <FileText className="h-5 w-5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isCurrentUser ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {attachment.file_name}
                                  </p>
                                  <p className={`text-xs ${
                                    isCurrentUser ? 'text-white/80' : 'text-gray-500'
                                  }`}>
                                    {(attachment.file_size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Download className="h-4 w-4 flex-shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}
                        {message.content && (
                          <p className="text-[15px] leading-relaxed break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      {isCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover/message:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="チャットを削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 px-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ja })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div
          className="p-4 border-t border-gray-100 bg-white relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500 bg-opacity-90 rounded-lg">
              <div className="text-center">
                <Paperclip className="h-12 w-12 text-white mx-auto mb-2 animate-bounce" />
                <p className="text-white text-lg font-semibold">ファイルをドロップしてアップロード</p>
              </div>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm"
                >
                  {attachment.type === 'image' ? (
                    <Image className="h-4 w-4 text-blue-600 mr-2" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-blue-600 mr-2" />
                  )}
                  <span className="text-sm text-gray-700 truncate max-w-[120px] font-medium">
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.ai,.psd,.zip,.rar,.txt,.csv"
              multiple
            />
            <button
              type="button"
              className="text-gray-400 hover:text-blue-600 p-2.5 rounded-xl hover:bg-blue-50 transition-all"
              onClick={handleFileUpload}
              title="ファイルを添付"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-blue-600 p-2.5 rounded-xl hover:bg-blue-50 transition-all"
              onClick={handleFileUpload}
              title="画像を添付"
            >
              <Image className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="チャットを入力..."
                className="w-full border border-gray-200 rounded-full px-5 py-3 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow"
              />
            </div>
            <button
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || uploadingImage}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-sm"
              title="送信"
            >
              {uploadingImage ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
