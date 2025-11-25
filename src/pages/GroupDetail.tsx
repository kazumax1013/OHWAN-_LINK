import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getGroupById, getPostsByGroupId, getUserById } from '../data/mockData';
import PostCard from '../components/posts/PostCard';
import PostCreator from '../components/posts/PostCreator';
import { Users, Calendar, FileText, Settings } from 'lucide-react';

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const group = getGroupById(id || '');
  
  if (!group) {
    return <Navigate to="/groups/" replace />;
  }
  
  const groupPosts = getPostsByGroupId(group.id);
  const groupCreator = getUserById(group.creatorId);
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Group Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6 animate-fade-in">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${group.coverUrl})` }}
        />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-20">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white overflow-hidden">
              <img 
                src={group.coverUrl}
                alt={group.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Users className="h-4 w-4 mr-1.5" />
                    {group.members.length} メンバー
                    <span className="mx-2">•</span>
                    {group.isPrivate ? 'プライベートプロジェクト' : 'パブリックプロジェクト'}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <Settings className="h-4 w-4 mr-2" />
                    プロジェクト設定
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mt-4">{group.description}</p>
              <div className="mt-6 flex space-x-4">
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  メンバーを表示
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Calendar className="h-4 w-4 mr-2" />
                  イベント
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  ファイル
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Group Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <PostCreator onPostCreated={() => {}} groupId={group.id} />
          
          {groupPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {groupPosts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">まだ投稿がありません。最初の投稿を作成しましょう！</p>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow p-5 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">概要</h3>
            <div className="text-sm text-gray-700 space-y-3">
              <div>
                <span className="font-medium">作成者:</span>{' '}
                {groupCreator?.name}
              </div>
              <div>
                <span className="font-medium">作成日:</span>{' '}
                {new Date(group.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">プライバシー:</span>{' '}
                {group.isPrivate ? 'プライベート' : 'パブリック'}
              </div>
            </div>
          </div>
          
          {/* Members */}
          <div className="bg-white rounded-lg shadow p-5 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">メンバー</h3>
              <span className="text-sm text-primary-600 hover:underline cursor-pointer">
                すべて表示
              </span>
            </div>
            <div className="space-y-3">
              {group.members.slice(0, 5).map(memberId => {
                const member = getUserById(memberId);
                return member ? (
                  <div key={member.id} className="flex items-center">
                    <img 
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.position}</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;