import { supabase } from '../lib/supabase';

export interface WellnessCheckin {
  id: string;
  user_id: string;
  date: string;
  mood_score?: number;
  stress_level?: number;
  energy_level?: number;
  work_hours?: number;
  breaks_taken: number;
  notes?: string;
  created_at: string;
}

export const wellnessService = {
  async createCheckin(data: {
    date: string;
    mood_score?: number;
    stress_level?: number;
    energy_level?: number;
    work_hours?: number;
    breaks_taken?: number;
    notes?: string;
  }) {
    const { data: checkin, error } = await supabase
      .from('employee_wellness_checkins')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return checkin;
  },

  async updateCheckin(date: string, updates: Partial<WellnessCheckin>) {
    const { data, error } = await supabase
      .from('employee_wellness_checkins')
      .update(updates)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCheckin(date: string) {
    const { data, error } = await supabase
      .from('employee_wellness_checkins')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCheckins(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('employee_wellness_checkins')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWellnessStats(days: number = 30) {
    const checkins = await this.getCheckins(days);

    const stats = {
      averageMood: 0,
      averageStress: 0,
      averageEnergy: 0,
      totalWorkHours: 0,
      averageWorkHours: 0,
      totalBreaks: 0,
      burnoutRisk: 'low' as 'low' | 'medium' | 'high',
    };

    let moodSum = 0, moodCount = 0;
    let stressSum = 0, stressCount = 0;
    let energySum = 0, energyCount = 0;
    let workHoursSum = 0, workHoursCount = 0;

    checkins.forEach((checkin) => {
      if (checkin.mood_score) {
        moodSum += checkin.mood_score;
        moodCount++;
      }
      if (checkin.stress_level) {
        stressSum += checkin.stress_level;
        stressCount++;
      }
      if (checkin.energy_level) {
        energySum += checkin.energy_level;
        energyCount++;
      }
      if (checkin.work_hours) {
        workHoursSum += checkin.work_hours;
        workHoursCount++;
      }
      stats.totalBreaks += checkin.breaks_taken || 0;
    });

    stats.averageMood = moodCount > 0 ? moodSum / moodCount : 0;
    stats.averageStress = stressCount > 0 ? stressSum / stressCount : 0;
    stats.averageEnergy = energyCount > 0 ? energySum / energyCount : 0;
    stats.totalWorkHours = workHoursSum;
    stats.averageWorkHours = workHoursCount > 0 ? workHoursSum / workHoursCount : 0;

    if (stats.averageStress >= 4 || stats.averageMood <= 2 || stats.averageWorkHours >= 10) {
      stats.burnoutRisk = 'high';
    } else if (stats.averageStress >= 3 || stats.averageMood <= 3 || stats.averageWorkHours >= 9) {
      stats.burnoutRisk = 'medium';
    }

    return stats;
  },

  async getTodayCheckin() {
    const today = new Date().toISOString().split('T')[0];
    return this.getCheckin(today);
  },
};
