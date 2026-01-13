import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

export const activityService = {
  async getActivities(teamId: string, limit = 100) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getActivityLogs(teamId: string, limit = 100) {
    return this.getActivities(teamId, limit);
  },

  async logActivity(
    teamId: string,
    userId: string | null,
    actionType: string,
    entityType: string,
    entityId: string | null,
    details: Record<string, any> = {}
  ) {
    return this.createActivityLog({
      team_id: teamId,
      user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  },

  async createActivityLog(log: ActivityLogInsert) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async logIssueAction(
    teamId: string,
    userId: string | null,
    actionType: string,
    issueId: string,
    details: Record<string, any> = {}
  ) {
    return this.createActivityLog({
      team_id: teamId,
      user_id: userId,
      action_type: actionType,
      entity_type: 'issue',
      entity_id: issueId,
      details,
    });
  },

  async logIntegrationAction(
    teamId: string,
    userId: string | null,
    actionType: string,
    integrationId: string,
    details: Record<string, any> = {}
  ) {
    return this.createActivityLog({
      team_id: teamId,
      user_id: userId,
      action_type: actionType,
      entity_type: 'integration',
      entity_id: integrationId,
      details,
    });
  },

  async getRecentActivity(teamId: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('team_id', teamId)
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
