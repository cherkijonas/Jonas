import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Issue = Database['public']['Tables']['issues']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueUpdate = Database['public']['Tables']['issues']['Update'];

export const issuesService = {
  async getIssues(teamId: string) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getIssueById(id: string) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createIssue(issue: IssueInsert) {
    const { data, error } = await supabase
      .from('issues')
      .insert(issue)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIssue(id: string, updates: IssueUpdate) {
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resolveIssue(id: string) {
    return this.updateIssue(id, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    });
  },

  async snoozeIssue(id: string, until: Date) {
    return this.updateIssue(id, {
      status: 'snoozed',
      snoozed_until: until.toISOString(),
    });
  },

  async assignIssue(id: string, userId: string | null) {
    return this.updateIssue(id, {
      assigned_to: userId,
    });
  },

  async getIssuesByStatus(teamId: string, status: Issue['status']) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getIssuesBySeverity(teamId: string, severity: Issue['severity']) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('team_id', teamId)
      .eq('severity', severity)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async searchIssues(teamId: string, query: string) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('team_id', teamId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
