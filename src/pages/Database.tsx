import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Download,
  FileImage,
  FileText,
  Search,
  MessageSquare,
  FileIcon,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  source_type: 'post' | 'message';
  source_id: string;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    name: string;
    avatar_url: string;
  };
}

interface MonthFolder {
  key: string;
  label: string;
  attachments: Attachment[];
  isExpanded: boolean;
}

const Database: React.FC = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [monthFolders, setMonthFolders] = useState<MonthFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'post' | 'message'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, []);

  useEffect(() => {
    organizeByMonth();
  }, [attachments, searchQuery, filterType, filterSource]);

  const fetchAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('attachments')
        .select(`
          *,
          uploader:profiles!attachments_uploaded_by_fkey(name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAttachments(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setIsLoading(false);
    }
  };

  const organizeByMonth = () => {
    let filtered = [...attachments];

    if (searchQuery) {
      filtered = filtered.filter(att =>
        att.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(att => {
        if (filterType === 'image') {
          return att.file_type.startsWith('image/');
        } else {
          return !att.file_type.startsWith('image/');
        }
      });
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(att => att.source_type === filterSource);
    }

    const monthMap = new Map<string, Attachment[]>();

    filtered.forEach(att => {
      const date = parseISO(att.created_at);
      const monthKey = format(date, 'yyyy-MM');

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(att);
    });

    const folders: MonthFolder[] = Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, atts]) => ({
        key,
        label: format(parseISO(`${key}-01`), 'yyyy年M月', { locale: ja }),
        attachments: atts,
        isExpanded: false
      }));

    if (folders.length > 0) {
      folders[0].isExpanded = true;
    }

    setMonthFolders(folders);
  };

  const toggleFolder = (folderKey: string) => {
    setMonthFolders(prev =>
      prev.map(folder =>
        folder.key === folderKey
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <FileText className="h-5 w-5 text-orange-600" />;
    } else if (fileType.includes('photoshop') || fileType.endsWith('.psd')) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    } else if (fileType.includes('illustrator') || fileType.endsWith('.ai')) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartEdit = (attachment: Attachment) => {
    setEditingId(attachment.id);
    setEditingName(attachment.file_name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (attachmentId: string) => {
    if (!editingName.trim()) {
      alert('ファイル名を入力してください');
      return;
    }

    try {
      const { error } = await supabase
        .from('attachments')
        .update({ file_name: editingName.trim() })
        .eq('id', attachmentId);

      if (error) throw error;

      setAttachments(prev =>
        prev.map(att =>
          att.id === attachmentId ? { ...att, file_name: editingName.trim() } : att
        )
      );

      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating file name:', error);
      alert('ファイル名の変更に失敗しました');
    }
  };

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`「${fileName}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('ファイルの削除に失敗しました');
    }
  };

  const handlePreview = (attachment: Attachment) => {
    setPreviewFile(attachment);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const totalFiles = monthFolders.reduce((sum, folder) => sum + folder.attachments.length, 0);
  const totalImages = monthFolders.reduce(
    (sum, folder) => sum + folder.attachments.filter(a => a.file_type.startsWith('image/')).length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">データベース</h1>
        <p className="text-gray-600">タイムラインとチャットの添付ファイルを管理</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ファイル名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">すべてのタイプ</option>
              <option value="image">画像のみ</option>
              <option value="document">ドキュメントのみ</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">すべての送信元</option>
              <option value="post">タイムライン</option>
              <option value="message">チャット</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            <span>合計: {totalFiles}件</span>
          </div>
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            <span>画像: {totalImages}件</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {monthFolders.length === 0 ? (
          <div className="text-center py-12">
            <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">ファイルが見つかりません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {monthFolders.map((folder) => (
              <div key={folder.key} className="bg-white">
                <button
                  onClick={() => toggleFolder(folder.key)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {folder.isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    {folder.isExpanded ? (
                      <FolderOpen className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Folder className="h-6 w-6 text-yellow-500" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{folder.label}</h3>
                      <p className="text-sm text-gray-500">{folder.attachments.length}件のファイル</p>
                    </div>
                  </div>
                </button>

                {folder.isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ファイル
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              サイズ
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              送信元
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              アップロード者
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              日時
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {folder.attachments.map((attachment) => (
                            <tr key={attachment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {getFileIcon(attachment.file_type)}
                                  <div className="ml-3 flex-1 min-w-0">
                                    {editingId === attachment.id ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editingName}
                                          onChange={(e) => setEditingName(e.target.value)}
                                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-full max-w-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => handleSaveEdit(attachment.id)}
                                          className="text-green-600 hover:text-green-700"
                                          title="保存"
                                        >
                                          <Save className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="text-gray-600 hover:text-gray-700"
                                          title="キャンセル"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                        {attachment.file_name}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      {attachment.file_type}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatFileSize(attachment.file_size)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  attachment.source_type === 'post'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {attachment.source_type === 'post' ? (
                                    <>
                                      <FileText className="h-3 w-3 mr-1" />
                                      タイムライン
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      チャット
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    src={attachment.uploader?.avatar_url || ''}
                                    alt={attachment.uploader?.name || ''}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <div className="ml-2 text-sm text-gray-900">
                                    {attachment.uploader?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {format(parseISO(attachment.created_at), 'M月d日 HH:mm', { locale: ja })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePreview(attachment)}
                                    className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    title="プレビュー"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                                    className="inline-flex items-center px-2 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    title="ダウンロード"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStartEdit(attachment)}
                                    className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    title="名前を編集"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(attachment.id, attachment.file_name)}
                                    className="inline-flex items-center px-2 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    title="削除"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleClosePreview}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {getFileIcon(previewFile.file_type)}
                    <span className="ml-2">{previewFile.file_name}</span>
                  </h3>
                  <button
                    onClick={handleClosePreview}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  {previewFile.file_type.startsWith('image/') ? (
                    <div className="flex justify-center">
                      <img
                        src={previewFile.file_url}
                        alt={previewFile.file_name}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      />
                    </div>
                  ) : previewFile.file_type === 'application/pdf' ? (
                    <div className="w-full h-[70vh]">
                      <iframe
                        src={previewFile.file_url}
                        className="w-full h-full border-0 rounded-lg"
                        title={previewFile.file_name}
                      />
                    </div>
                  ) : previewFile.file_type.startsWith('text/') ? (
                    <div className="w-full h-[70vh] overflow-auto">
                      <iframe
                        src={previewFile.file_url}
                        className="w-full h-full border-0 rounded-lg"
                        title={previewFile.file_name}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">このファイル形式はプレビューできません</p>
                      <button
                        onClick={() => handleDownload(previewFile.file_url, previewFile.file_name)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        ダウンロード
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ファイルサイズ:</span>
                      <span className="ml-2 text-gray-900">{formatFileSize(previewFile.file_size)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ファイル形式:</span>
                      <span className="ml-2 text-gray-900">{previewFile.file_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">アップロード日時:</span>
                      <span className="ml-2 text-gray-900">
                        {format(parseISO(previewFile.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                      </span>
                    </div>
                    {previewFile.uploader && (
                      <div>
                        <span className="text-gray-500">アップロード者:</span>
                        <span className="ml-2 text-gray-900">{previewFile.uploader.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  onClick={() => handleDownload(previewFile.file_url, previewFile.file_name)}
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  ダウンロード
                </button>
                <a
                  href={previewFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  新しいタブで開く
                </a>
                <button
                  onClick={handleClosePreview}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Database;
