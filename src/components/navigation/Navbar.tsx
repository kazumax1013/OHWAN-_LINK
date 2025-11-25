import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Search, Menu, LogOut, User } from 'lucide-react';

interface NavbarProps {
  onToggleNotifications: () => void;
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleNotifications, onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-black border-b border-gray-800 px-4 py-2.5 flex justify-between items-center">
      <div className="flex items-center">
        <button 
          className="text-white hover:text-gray-200 focus:outline-none lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="ml-4 lg:ml-0 flex items-center">
          <span className="text-xl font-bold text-white">OHWAN LINK</span>
        </Link>
      </div>

      <div className="flex items-center flex-1 justify-center sm:justify-start">
        <div className="max-w-lg w-full mx-4 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="検索..."
              onClick={() => navigate('/search')}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className="text-white hover:text-gray-200 focus:outline-none relative"
          onClick={onToggleNotifications}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-once">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:block relative group">
          <Link to={`/profile/${currentUser?.id}`} className="flex items-center text-sm focus:outline-none">
            <img
              className="h-8 w-8 rounded-full object-cover hover:opacity-80 transition-opacity"
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
            />
          </Link>
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 hidden group-hover:block z-10">
            <Link
              to={`/profile/${currentUser?.id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              <User className="h-4 w-4 mr-2" />
              プロフィール
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;