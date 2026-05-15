import { supabase, isSupabaseConfigured, isValidUUID } from '../lib/supabase';
import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'tripmaker_notifications';

export async function sendNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 11),
    read: false,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && isValidUUID(notification.user_id)) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotification])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err.message?.includes('relation "notifications" does not exist')) {
        console.error('[NotificationService] Supabase table "notifications" is missing. Please run the setup SQL script.');
      }
      console.warn('[NotificationService] Supabase error (sendNotification), falling back to localStorage:', err);
    }
  }

  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  notifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  return newNotification;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!userId || userId === 'guest') return [];
  
  if (isSupabaseConfigured() && isValidUUID(userId)) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err: any) {
      if (err.message?.includes('relation "notifications" does not exist')) {
        console.error('[NotificationService] Supabase table "notifications" is missing. Please run the setup SQL script.');
      }
      console.warn('[NotificationService] Supabase error (getNotifications), falling back to localStorage:', err);
    }
  }

  const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  return notifications.filter((n: Notification) => n.user_id === userId);
}

export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err: any) {
    if (err.message?.includes('relation "notifications" does not exist')) {
      console.error('[NotificationService] Supabase table "notifications" is missing. Please run the setup SQL script.');
    }
    console.warn('[NotificationService] Supabase error (markAsRead), falling back to localStorage:', err);
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const index = notifications.findIndex((n: Notification) => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }
}
