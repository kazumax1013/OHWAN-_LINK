import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/mockData';
import { X, Users, Search, Check } from 'lucide-react';

interface CreateGroupChatProps {
  onClose: () => void;
  onCreateGroup: (name: string, participants: string[]) => void;
}

const CreateGroupChat: React.FC<CreateGroupChatProps> = ({ onClose, onCreateGroup }) => {
  const { currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const availableUsers = users.filter(user => 
    user.id !== currentUser?.id &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName, [...selectedUsers, currentUser?.id || '']);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">新しいグループチャット</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              グループ名
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="グループ名を入力"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メンバーを追加
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="名前で検索"
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <div 
                      key={user.id}
                      className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-4 h-4 rounded-full mr-1"
                      />
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {availableUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectUser(user.id)}
              >
                <img
                  src={user.avatarUrl}
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

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                グループを作成
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupChat;