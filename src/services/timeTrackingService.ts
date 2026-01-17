import { supabase } from '../lib/supabase';

export interface TimeTrackingEntry {
  id: string;
  user_id: string;
  tool_name: string;
  activity_type: 'focus' | 'meeting' | 'communication' | 'break';
  duration_minutes: number;
  energy_level?: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export const timeTrackingService = {
  async startTracking(data: {
    tool_name: string;
    activity_type: TimeTrackingEntry['activity_type'];
    energy_level?: number;
  }) {
    const { data: entry, error } = await supabase
      .from('employee_time_tracking')
      .insert({
        ...data,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return entry;
  },

  async stopTracking(id: string, duration_minutes: number) {
    const { data, error } = await supabase
      .from('employee_time_tracking')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTimeTrackingByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTimeStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    if (error) throw error;

    const stats = {
      totalMinutes: 0,
      byTool: {} as Record<string, number>,
      byActivityType: {} as Record<string, number>,
      averageEnergyLevel: 0,
    };

    let energyCount = 0;
    let totalEnergy = 0;

    data?.forEach((entry) => {
      stats.totalMinutes += entry.duration_minutes;
      stats.byTool[entry.tool_name] = (stats.byTool[entry.tool_name] || 0) + entry.duration_minutes;
      stats.byActivityType[entry.activity_type] = (stats.byActivityType[entry.activity_type] || 0) + entry.duration_minutes;

      if (entry.energy_level) {
        totalEnergy += entry.energy_level;
        energyCount++;
      }
    });

    stats.averageEnergyLevel = energyCount > 0 ? totalEnergy / energyCount : 0;

    return stats;
  },

  async getHeatmapData(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString());

    if (error) throw error;

    const heatmap: Record<string, Record<number, number>> = {};

    data?.forEach((entry) => {
      const date = new Date(entry.started_at);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();

      if (!heatmap[dateKey]) {
        heatmap[dateKey] = {};
      }
      heatmap[dateKey][hour] = (heatmap[dateKey][hour] || 0) + entry.duration_minutes;
    });

    return heatmap;
  },
};
