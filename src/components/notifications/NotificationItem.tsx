import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  MessageSquare,
  ThumbsUp,
  Users,
  AtSign,
  UserPlus,
  MessageCircle
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // actionUrlがある場合は画面遷移
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-secondary-500" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-accent-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-primary-500" />;
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-primary-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-secondary-500" />;
      case 'mention':
        return <AtSign className="h-5 w-5 text-primary-500" />;
      case 'system':
        return <Users className="h-5 w-5 text-gray-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-primary-500" />;
    }
  };

  const className = `relative p-4 rounded-lg border transition-colors duration-200 cursor-pointer ${
    notification.isRead
      ? 'bg-white border-gray-200 hover:bg-gray-50'
      : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  }`;

  return (
    <div
      className={className}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="mr-3 flex-shrink-0 mt-1">
          {getNotificationIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-800 font-medium">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ja })}
            </span>
          </div>
          {notification.user && (
            <div className="mt-2 flex items-center">
              {notification.user.avatar && (
                <img
                  src={notification.user.avatar}
                  alt={notification.user.name}
                  className="w-5 h-5 rounded-full mr-1"
                />
              )}
              <p className="text-xs text-gray-500">
                {notification.user.name}
              </p>
            </div>
          )}
        </div>
      </div>
      {!notification.isRead && (
        <div className="absolute top-4 right-4">
          <span className="h-2 w-2 rounded-full bg-orange-600" />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;