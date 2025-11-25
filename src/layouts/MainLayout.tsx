import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import NotificationPanel from '../components/notifications/NotificationPanel';
import { Home, ClipboardList, MessageSquare, Building2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const handleMobileNavClick = () => {
    setIsMobileSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'タイムライン' },
    { path: '/daily-reports', icon: ClipboardList, label: '日報' },
    { path: '/messages', icon: MessageSquare, label: 'チャット' },
    { path: '/events', icon: Building2, label: '物件管理' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={handleMobileNavClick}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full h-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={handleMobileNavClick}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Sidebar mobile onClose={handleMobileNavClick} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar 
          onToggleNotifications={toggleNotifications} 
          onToggleSidebar={toggleMobileSidebar}
        />

        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 lg:pb-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 lg:hidden">
          <nav className="flex justify-around">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex flex-col items-center py-2 px-3 ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-white hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
};

export default MainLayout;