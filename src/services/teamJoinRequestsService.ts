import { supabase } from '../lib/supabase';

export const teamJoinRequestsService = {
  async createJoinRequest(teamId: string, message?: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('team_join_requests')
      .insert({
        team_id: teamId,
        user_id: user.user.id,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserJoinRequests() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('team_join_requests')
      .select('*, teams(name, slug)')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTeamJoinRequests(teamId: string) {
    const { data, error } = await supabase
      .from('team_join_requests')
      .select('*, profiles(full_name, email), teams(name, slug)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllJoinRequestsForManager() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: memberships, error: membershipsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.user.id)
      .in('role', ['owner', 'admin']);

    if (membershipsError) throw membershipsError;

    const teamIds = memberships?.map(m => m.team_id) || [];

    if (teamIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('team_join_requests')
      .select('*, profiles(full_name, email), teams(name, slug)')
      .in('team_id', teamIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async approveRequest(requestId: string, teamId: string, userId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error: updateError } = await supabase
      .from('team_join_requests')
      .update({
        status: 'approved',
        reviewed_by: user.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'member',
      });

    if (memberError) throw memberError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        assigned_team_id: teamId,
      })
      .eq('id', userId);

    if (profileError) throw profileError;
  },

  async rejectRequest(requestId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('team_join_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  async getAllTeamsForJoinRequest() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.user.id);

    const userTeamIds = userTeams?.map((t) => t.team_id) || [];

    const { data: allTeams, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return allTeams.filter((team) => !userTeamIds.includes(team.id));
  },
};
