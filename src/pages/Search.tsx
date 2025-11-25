import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  users, 
  posts, 
  groups, 
  getUserById 
} from '../data/mockData';
import { 
  Search as SearchIcon, 
  Users, 
  FileText, 
  User,
  MessageSquare
} from 'lucide-react';

type SearchResult = {
  id: string;
  type: 'user' | 'post' | 'group';
  title: string;
  subtitle: string;
  link: string;
  avatar?: string;
};

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'posts' | 'groups'>('all');
  
  const getSearchResults = (): SearchResult[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    let results: SearchResult[] = [];
    
    if (activeFilter === 'all' || activeFilter === 'users') {
      const userResults = users
        .filter(user => 
          user.name.toLowerCase().includes(lowerQuery) ||
          user.position.toLowerCase().includes(lowerQuery) ||
          user.department.toLowerCase().includes(lowerQuery) ||
          user.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
        )
        .map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.name,
          subtitle: `${user.position} • ${user.department}`,
          link: `/profile/${user.id}`,
          avatar: user.avatarUrl,
        }));
      
      results = [...results, ...userResults];
    }
    
    if (activeFilter === 'all' || activeFilter === 'posts') {
      const postResults = posts
        .filter(post => 
          post.content.toLowerCase().includes(lowerQuery)
        )
        .map(post => {
          const author = getUserById(post.authorId);
          return {
            id: post.id,
            type: 'post' as const,
            title: `${author?.name || '不明'}さんの投稿`,
            subtitle: post.content.length > 100 
              ? `${post.content.substring(0, 100)}...` 
              : post.content,
            link: `/post/${post.id}`,
            avatar: author?.avatarUrl,
          };
        });
      
      results = [...results, ...postResults];
    }
    
    if (activeFilter === 'all' || activeFilter === 'groups') {
      const groupResults = groups
        .filter(group => 
          group.name.toLowerCase().includes(lowerQuery) ||
          group.description.toLowerCase().includes(lowerQuery)
        )
        .map(group => ({
          id: group.id,
          type: 'group' as const,
          title: group.name,
          subtitle: group.description.length > 100 
            ? `${group.description.substring(0, 100)}...` 
            : group.description,
          link: `/groups/${group.id}`,
        }));
      
      results = [...results, ...groupResults];
    }
    
    return results;
  };
  
  const searchResults = getSearchResults();
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'user':
        return <User className="h-4 w-4 text-primary-500" />;
      case 'post':
        return <MessageSquare className="h-4 w-4 text-accent-500" />;
      case 'group':
        return <Users className="h-4 w-4 text-secondary-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="ユーザー、投稿、グループを検索..."
              autoFocus
            />
          </div>
          
          <div className="mt-3 flex space-x-2">
            <button 
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              すべて
            </button>
            <button 
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                activeFilter === 'users' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('users')}
            >
              <User className="h-4 w-4 mr-1.5" />
              ユーザー
            </button>
            <button 
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                activeFilter === 'posts' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('posts')}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              投稿
            </button>
            <button 
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                activeFilter === 'groups' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('groups')}
            >
              <Users className="h-4 w-4 mr-1.5" />
              グループ
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {query && searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">"{query}\" に一致する結果は見つかりませんでした</p>
            </div>
          ) : query ? (
            <ul className="divide-y divide-gray-200">
              {searchResults.map(result => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    to={result.link}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center px-5 py-4">
                      <div className="flex-shrink-0">
                        {result.avatar ? (
                          <img 
                            src={result.avatar}
                            alt={result.title}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getTypeIcon(result.type)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="flex items-center text-sm font-medium text-gray-900">
                            {getTypeIcon(result.type)}
                            <span className="ml-1.5">
                              {result.type === 'user' && 'ユーザー'}
                              {result.type === 'post' && '投稿'}
                              {result.type === 'group' && 'グループ'}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">検索キーワードを入力してください</p>
              <p className="text-sm text-gray-400 mt-1">
                ユーザー、投稿、またはグループを検索できます
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;