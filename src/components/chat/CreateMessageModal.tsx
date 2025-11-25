import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Check, SendHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface CreateMessageModalProps {
  onClose: () => void;
  onCreateMessage: (recipientId: string, message: string) => void;
}

interface User {
  id: string;
  name: string;
  department: string;
  avatar_url: string;
  position: string;
}

const CreateMessageModal: React.FC<CreateMessageModalProps> = ({ onClose, onCreateMessage }) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, department, avatar_url, position')
        .neq('id', currentUser.id)
        .order('name');

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const availableUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && message.trim()) {
      onCreateMessage(selectedUser, message);
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">新しいメッセージ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              送信先
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="ユーザーを検索..."
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto mb-4 border border-gray-200 rounded-md">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                ユーザーが見つかりません
              </div>
            ) : (
              availableUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  className="w-full flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    selectedUser === user.id
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedUser === user.id && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メッセージ
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="メッセージを入力..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!selectedUser || !message.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <SendHorizontal className="h-4 w-4 mr-2" />
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMessageModal;
