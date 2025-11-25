import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: Notification[] = data?.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: notif.created_at,
        isRead: notif.is_read,
        actionUrl: notif.action_url,
        user: notif.actor ? {
          name: notif.actor.name,
          avatar: notif.actor.avatar_url
        } : undefined
      })) || [];

      setNotifications(formattedNotifications);

      const count = formattedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchNotifications();

      // リアルタイム更新の設定
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUser.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, currentUser]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => {
          if (notification.id === id && !notification.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
            return { ...notification, isRead: true };
          }
          return notification;
        })
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};