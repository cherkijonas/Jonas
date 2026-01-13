import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type EmployeeMetric = Database['public']['Tables']['employee_metrics']['Row'];
type EmployeeMetricInsert = Database['public']['Tables']['employee_metrics']['Insert'];
type EmployeeMetricUpdate = Database['public']['Tables']['employee_metrics']['Update'];

export const employeeMetricsService = {
  async getMetrics(userId: string) {
    const { data, error } = await supabase
      .from('employee_metrics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createMetrics(userId: string) {
    const { data, error } = await supabase
      .from('employee_metrics')
      .insert({
        user_id: userId,
        requests_submitted: 0,
        requests_approved: 0,
        requests_rejected: 0,
        integrations_connected: 0,
        issues_resolved: 0,
        teams_joined: 0,
        activity_score: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrCreateMetrics(userId: string) {
    let metrics = await this.getMetrics(userId);

    if (!metrics) {
      metrics = await this.createMetrics(userId);
    }

    return metrics;
  },

  async updateMetrics(userId: string, updates: Partial<EmployeeMetricUpdate>) {
    const { data, error } = await supabase
      .from('employee_metrics')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementMetric(userId: string, metric: keyof EmployeeMetric, amount: number = 1) {
    const current = await this.getOrCreateMetrics(userId);
    const currentValue = (current[metric] as number) || 0;

    return this.updateMetrics(userId, {
      [metric]: currentValue + amount,
    } as any);
  },

  async updateActivityScore(userId: string) {
    const metrics = await this.getOrCreateMetrics(userId);

    const score = Math.min(100,
      (metrics.requests_approved || 0) * 5 +
      (metrics.integrations_connected || 0) * 10 +
      (metrics.issues_resolved || 0) * 8 +
      (metrics.teams_joined || 0) * 15
    );

    return this.updateMetrics(userId, {
      activity_score: score,
      last_active_at: new Date().toISOString(),
    });
  },

  async getTeamMetrics(teamId: string) {
    const { data, error } = await supabase
      .from('employee_metrics')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          role
        )
      `)
      .in('user_id',
        supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', teamId)
      );

    if (error) throw error;
    return data;
  },
};
