import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Team = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];

export const teamsService = {
  async getUserTeams(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, teams(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map((tm) => ({
      ...tm.teams,
      role: tm.role,
    }));
  },

  async getTeamById(teamId: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTeam(name: string, slug: string, userId: string) {
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        slug,
        created_by: userId,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) throw memberError;

    await this.addDemoData(team.id);

    return team;
  },

  async addDemoData(teamId: string) {
    const demoIssues = [
      {
        team_id: teamId,
        tool: 'Slack',
        title: 'Thread bloquant dans #general',
        description: 'Un thread avec 47 messages non résolus ralentit les discussions',
        severity: 'high' as const,
        status: 'open' as const,
        metadata: { channel: 'general', messageCount: 47 }
      },
      {
        team_id: teamId,
        tool: 'Jira',
        title: 'Sprint bloqué depuis 3 jours',
        description: 'Le sprint Q1 Mobile App est bloqué, aucune mise à jour',
        severity: 'critical' as const,
        status: 'open' as const,
        metadata: { sprint: 'Q1 Mobile App', blockedDays: 3 }
      },
      {
        team_id: teamId,
        tool: 'Excel',
        title: 'Fichier corrompu détecté',
        description: 'Budget_Q1_2025.xlsx contient des formules invalides',
        severity: 'medium' as const,
        status: 'open' as const,
        metadata: { fileName: 'Budget_Q1_2025.xlsx' }
      }
    ];

    await supabase.from('issues').insert(demoIssues);

    const demoIntegrations = [
      {
        team_id: teamId,
        tool_name: 'Slack',
        status: 'connected' as const,
        last_sync: new Date().toISOString()
      },
      {
        team_id: teamId,
        tool_name: 'Jira',
        status: 'connected' as const,
        last_sync: new Date().toISOString()
      },
      {
        team_id: teamId,
        tool_name: 'Microsoft Excel',
        status: 'connected' as const,
        last_sync: new Date().toISOString()
      }
    ];

    await supabase.from('integrations').insert(demoIntegrations);
  },

  async getTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, profiles(*)')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addTeamMember(teamId: string, userId: string, role: TeamMemberInsert['role'] = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateMemberRole(teamId: string, userId: string, role: TeamMemberInsert['role']) {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
