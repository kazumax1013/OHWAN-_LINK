import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Folder, FileText, Plus, ChevronRight, X, Upload, Download, Trash2, ChevronDown } from 'lucide-react';

interface File {
  id: string;
  name: string;
  createdAt: string;
  file?: Blob;
  type: string;
  size: number;
}

interface Folder {
  id: string;
  name: string;
  files: File[];
  isExpanded?: boolean;
}

const Sign: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '2025-06',
      name: '2025年6月',
      files: [],
      isExpanded: true
    }
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFolder || !newFileName.trim() || !fileInputRef.current?.files?.length) return;

    const file = fileInputRef.current.files[0];
    const newFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      createdAt: new Date().toISOString(),
      file: file,
      type: file.type,
      size: file.size
    };

    setFolders(prev => prev.map(folder => 
      folder.id === selectedFolder
        ? { ...folder, files: [...folder.files, newFile] }
        : folder
    ));

    setShowCreateModal(false);
    setNewFileName('');
    setSelectedFolder(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      files: [],
      isExpanded: true
    };

    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      setFolders(prev => prev.filter(folder => folder.id !== folderToDelete));
    }
    setShowDeleteConfirmModal(false);
    setFolderToDelete(null);
  };

  const handleDownload = (file: File) => {
    if (!file.file) return;
    
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (folderId: string, fileId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId
        ? { ...folder, files: folder.files.filter(file => file.id !== fileId) }
        : folder
    ));
  };

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">サイン原稿</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Folder className="h-4 w-4 mr-2" />
            フォルダ作成
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/sign" className="hover:text-primary-600">サイン原稿</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>フォルダ一覧</span>
          </div>

          <div className="space-y-4">
            {folders.map(folder => (
              <div key={folder.id} className="rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center flex-1 hover:bg-gray-100 transition-colors rounded-md px-2 py-1"
                  >
                    <Folder className="h-5 w-5 text-primary-500 mr-3" />
                    <h3 className="text-sm font-medium text-gray-900">{folder.name}</h3>
                    <span className="ml-2 text-xs text-gray-500">
                      ({folder.files.length} ファイル)
                    </span>
                    <ChevronDown 
                      className={`h-4 w-4 ml-3 transition-transform ${
                        folder.isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                    title="フォルダを削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {folder.isExpanded && (
                  folder.files.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {folder.files.map(file => (
                        <div key={file.id} className="flex items-center p-4 hover:bg-gray-50">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100"
                              title="ダウンロード"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(folder.id, file.id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                              title="削除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      このフォルダにはまだファイルがありません
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">新規ファイル作成</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFile} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="folder" className="block text-sm font-medium text-gray-700">
                    保存先フォルダ
                  </label>
                  <select
                    id="folder"
                    value={selectedFolder || ''}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  >
                    <option value="">フォルダを選択</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fileName" className="block text-sm font-medium text-gray-700">
                    ファイル名
                  </label>
                  <input
                    type="text"
                    id="fileName"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="ファイル名を入力"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ファイルをアップロード
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>ファイルを選択</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            ref={fileInputRef}
                            required
                          />
                        </label>
                        <p className="pl-1">またはドラッグ＆ドロップ</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, Word, Excel など
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">新規フォルダ作成</h2>
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="p-6">
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700">
                  フォルダ名
                </label>
                <input
                  type="text"
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="フォルダ名を入力"
                  required
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  フォルダを削除
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    このフォルダとフォルダ内のすべてのファイルが削除されます。この操作は取り消せません。
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFolder}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sign;