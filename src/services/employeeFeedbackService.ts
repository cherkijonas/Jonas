import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type EmployeeFeedback = Database['public']['Tables']['employee_feedback']['Row'];
type EmployeeFeedbackInsert = Database['public']['Tables']['employee_feedback']['Insert'];
type EmployeeFeedbackUpdate = Database['public']['Tables']['employee_feedback']['Update'];

export const employeeFeedbackService = {
  async getMyFeedback(userId: string) {
    const { data, error } = await supabase
      .from('employee_feedback')
      .select(`
        *,
        from_profile:from_user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUnreadFeedback(userId: string) {
    const { data, error } = await supabase
      .from('employee_feedback')
      .select(`
        *,
        from_profile:from_user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('to_user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async giveFeedback(feedback: EmployeeFeedbackInsert) {
    const { data, error } = await supabase
      .from('employee_feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(feedbackId: string) {
    const { data, error } = await supabase
      .from('employee_feedback')
      .update({ is_read: true })
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('employee_feedback')
      .update({ is_read: true })
      .eq('to_user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data;
  },

  async getFeedbackStats(userId: string) {
    const feedback = await this.getMyFeedback(userId);

    const stats = {
      total: feedback.length,
      unread: feedback.filter(f => !f.is_read).length,
      byType: {
        general: feedback.filter(f => f.type === 'general').length,
        performance: feedback.filter(f => f.type === 'performance').length,
        recognition: feedback.filter(f => f.type === 'recognition').length,
        improvement: feedback.filter(f => f.type === 'improvement').length,
      },
      averageRating: feedback.filter(f => f.rating).length > 0
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length
        : 0,
    };

    return stats;
  },

  async getTeamFeedback(teamId: string) {
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    const userIds = members.map(m => m.user_id);

    const { data, error } = await supabase
      .from('employee_feedback')
      .select(`
        *,
        from_profile:from_user_id (
          full_name,
          email
        ),
        to_profile:to_user_id (
          full_name,
          email
        )
      `)
      .in('to_user_id', userIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
