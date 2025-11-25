import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Users,
  MessageSquare,
  Building2,
  User,
  X,
  Database,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const linkClasses = "flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150";
  const activeLinkClasses = "bg-orange-50 text-orange-600";

  const handleLinkClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {mobile && onClose && (
        <div className="px-4 pt-4 flex justify-end items-center">
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto pt-6">
        <div className="px-6 pb-6 flex justify-center">
          <img
            src="/ohwan-logo.svg"
            alt="OHWAN"
            className="h-12 w-auto"
          />
        </div>

        <div className="px-6 pb-4">
          <Link
            to={`/profile/${currentUser?.id}`}
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={handleLinkClick}
          >
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.position}</p>
            </div>
          </Link>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
            end
          >
            <Home className="h-5 w-5 mr-3" />
            タイムライン
          </NavLink>

          <NavLink
            to="/members"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <Users className="h-5 w-5 mr-3" />
            メンバー
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <MessageSquare className="h-5 w-5 mr-3" />
            チャット
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <Building2 className="h-5 w-5 mr-3" />
            物件管理
          </NavLink>

          <NavLink
            to="/daily-reports"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            日報
          </NavLink>

          <NavLink
            to="/database"
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <Database className="h-5 w-5 mr-3" />
            データベース
          </NavLink>

          <NavLink
            to={`/profile/${currentUser?.id}`}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            onClick={handleLinkClick}
          >
            <User className="h-5 w-5 mr-3" />
            マイプロフィール
          </NavLink>

          <button
            onClick={handleLogout}
            className={`${linkClasses} w-full text-left`}
          >
            <LogOut className="h-5 w-5 mr-3" />
            サインアウト
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;