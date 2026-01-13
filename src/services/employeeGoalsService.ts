import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type EmployeeGoal = Database['public']['Tables']['employee_goals']['Row'];
type EmployeeGoalInsert = Database['public']['Tables']['employee_goals']['Insert'];
type EmployeeGoalUpdate = Database['public']['Tables']['employee_goals']['Update'];

export const employeeGoalsService = {
  async getMyGoals(userId: string) {
    const { data, error } = await supabase
      .from('employee_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActiveGoals(userId: string) {
    const { data, error } = await supabase
      .from('employee_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('target_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getGoalById(id: string) {
    const { data, error } = await supabase
      .from('employee_goals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createGoal(goal: EmployeeGoalInsert) {
    const { data, error } = await supabase
      .from('employee_goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGoal(id: string, updates: EmployeeGoalUpdate) {
    const { data, error } = await supabase
      .from('employee_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGoalProgress(id: string, progress: number) {
    const updates: EmployeeGoalUpdate = {
      progress,
      updated_at: new Date().toISOString(),
    };

    if (progress >= 100) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('employee_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('employee_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTeamGoals(teamId: string) {
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    const userIds = members.map(m => m.user_id);

    const { data, error } = await supabase
      .from('employee_goals')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getGoalsStats(userId: string) {
    const goals = await this.getMyGoals(userId);

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      abandoned: goals.filter(g => g.status === 'abandoned').length,
      averageProgress: goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
        : 0,
      onTrack: goals.filter(g => {
        if (g.status !== 'active' || !g.target_date) return false;
        const daysLeft = Math.floor((new Date(g.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && (g.progress || 0) > 50;
      }).length,
    };

    return stats;
  },
};
