import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_id?: string;
  created_at: string;
  updated_at: string;
}

export const notificationsService = {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    relatedId?: string
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },
};
