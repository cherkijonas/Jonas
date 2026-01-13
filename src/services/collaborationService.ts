import { supabase } from '../lib/supabase';

export interface CollaborationStatus {
  id: string;
  user_id: string;
  status: 'available' | 'focus' | 'busy' | 'meeting' | 'away';
  current_task?: string;
  available_for_help: boolean;
  context_message?: string;
  updated_at: string;
}

export const collaborationService = {
  async updateStatus(data: {
    status: CollaborationStatus['status'];
    current_task?: string;
    available_for_help?: boolean;
    context_message?: string;
  }) {
    const { data: existing } = await supabase
      .from('employee_collaboration_status')
      .select('id')
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('employee_collaboration_status')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('employee_collaboration_status')
        .insert({
          ...data,
          available_for_help: data.available_for_help ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return created;
    }
  },

  async getMyStatus() {
    const { data, error } = await supabase
      .from('employee_collaboration_status')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTeamStatuses() {
    const { data, error } = await supabase
      .from('employee_collaboration_status')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `);

    if (error) throw error;
    return data || [];
  },

  async getAvailableTeamMembers() {
    const { data, error } = await supabase
      .from('employee_collaboration_status')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('available_for_help', true)
      .in('status', ['available', 'busy']);

    if (error) throw error;
    return data || [];
  },
};
