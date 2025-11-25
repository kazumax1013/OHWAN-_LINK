import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, UserCheck } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  position: string;
  department: string;
  office: string;
  avatarUrl: string;
  is_online: boolean;
  isFollowing?: boolean;
}

const Members: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMembers();
    fetchFollowing();
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.position.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        member.office.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, position, department, office, avatar_url, is_online')
        .order('name');

      if (error) throw error;

      const membersData = data?.map(profile => ({
        id: profile.id,
        name: profile.name || '',
        position: profile.position || '',
        department: profile.department || '',
        office: profile.office || '',
        avatarUrl: profile.avatar_url || '',
        is_online: profile.is_online || false,
      })) || [];

      setMembers(membersData);
      setFilteredMembers(membersData);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (error) throw error;

      const ids = new Set(data?.map(f => f.following_id) || []);
      setFollowingIds(ids);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const handleFollowToggle = async (memberId: string) => {
    if (!currentUser) return;

    try {
      const isFollowing = followingIds.has(memberId);

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', memberId);

        if (error) throw error;

        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(memberId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: memberId
          });

        if (error) throw error;

        setFollowingIds(prev => new Set(prev).add(memberId));
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('フォロー操作に失敗しました');
    }
  };

  const handleMemberClick = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">メンバー</h1>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="名前、役職、部署、営業所で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isCurrentUser = member.id === currentUser?.id;
          const isFollowing = followingIds.has(member.id);

          return (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => handleMemberClick(member.id)}
                >
                  <div className="relative">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    {member.is_online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {member.name}
                      </h3>
                      {member.is_online && (
                        <span className="text-xs text-green-600 font-medium">
                          ログイン中
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{member.position}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.department} - {member.office}
                    </p>
                  </div>
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() => handleFollowToggle(member.id)}
                    className={`ml-2 p-2 rounded-full transition-colors ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                    title={isFollowing ? 'フォロー中' : 'フォローする'}
                  >
                    {isFollowing ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <UserPlus className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">メンバーが見つかりませんでした</p>
        </div>
      )}
    </div>
  );
};

export default Members;
