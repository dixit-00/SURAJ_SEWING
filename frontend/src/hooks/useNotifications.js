import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { dbUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!dbUser) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${dbUser.id}`
        },
        (payload) => {
          const newNotif = payload.new;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((count) => count + 1);
          
          toast.success(newNotif.message, {
            icon: '🔔',
            title: newNotif.title,
          });
          
          console.log("New Realtime Notification:", newNotif.title, newNotif.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbUser]);

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setUnreadCount(count => Math.max(0, count - 1));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', dbUser.id).eq('is_read', false);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
