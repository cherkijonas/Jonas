import { supabase } from '../lib/supabase';

export interface UnifiedNotification {
  id: string;
  user_id: string;
  source_tool: string;
  type: string;
  title: string;
  content?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  snoozed_until?: string;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const unifiedNotificationsService = {
  async createNotification(data: {
    source_tool: string;
    type: string;
    title: string;
    content?: string;
    priority?: UnifiedNotification['priority'];
    action_url?: string;
    metadata?: Record<string, any>;
  }) {
    const { data: notification, error } = await supabase
      .from('employee_notifications')
      .insert({
        ...data,
        priority: data.priority || 'medium',
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  },

  async getNotifications(options?: {
    unreadOnly?: boolean;
    priority?: UnifiedNotification['priority'];
    limit?: number;
  }) {
    let query = supabase
      .from('employee_notifications')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const now = new Date().toISOString();
    query = query.or(`snoozed_until.is.null,snoozed_until.lt.${now}`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('employee_notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('employee_notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  },

  async archiveNotification(id: string) {
    const { data, error } = await supabase
      .from('employee_notifications')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async snoozeNotification(id: string, minutes: number) {
    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

    const { data, error } = await supabase
      .from('employee_notifications')
      .update({ snoozed_until: snoozeUntil.toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUnreadCount() {
    const { count, error } = await supabase
      .from('employee_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) throw error;
    return count || 0;
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('employee_notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getNotificationsBySource(sourceTool: string) {
    const { data, error } = await supabase
      .from('employee_notifications')
      .select('*')
      .eq('source_tool', sourceTool)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async smartFilter() {
    const notifications = await this.getNotifications();

    const filtered = {
      urgent: [] as UnifiedNotification[],
      actionable: [] as UnifiedNotification[],
      informational: [] as UnifiedNotification[],
      lowPriority: [] as UnifiedNotification[],
    };

    notifications.forEach((notif) => {
      if (notif.priority === 'urgent') {
        filtered.urgent.push(notif);
      } else if (notif.action_url) {
        filtered.actionable.push(notif);
      } else if (notif.priority === 'low') {
        filtered.lowPriority.push(notif);
      } else {
        filtered.informational.push(notif);
      }
    });

    return filtered;
  },
};
