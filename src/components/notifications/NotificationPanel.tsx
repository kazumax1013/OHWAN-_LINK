import React from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="fixed inset-0 overflow-hidden z-50" onClick={onClose}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <div 
          className="fixed inset-y-0 right-0 max-w-md w-full flex" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full bg-white shadow-xl flex flex-col h-full overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              <div className="flex space-x-4">
                {unreadCount > 0 && (
                  <button 
                    className="text-sm text-primary-600 hover:text-primary-700"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;