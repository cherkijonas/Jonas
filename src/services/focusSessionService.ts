import { supabase } from '../lib/supabase';

export interface FocusSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  actual_duration_minutes?: number;
  interruptions_count: number;
  quality_score?: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export const focusSessionService = {
  async startFocusSession(duration_minutes: number) {
    const { data: session, error } = await supabase
      .from('employee_focus_sessions')
      .insert({
        duration_minutes,
        started_at: new Date().toISOString(),
        interruptions_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  },

  async endFocusSession(id: string, actual_duration_minutes: number, quality_score: number) {
    const { data, error } = await supabase
      .from('employee_focus_sessions')
      .update({
        ended_at: new Date().toISOString(),
        actual_duration_minutes,
        quality_score,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addInterruption(id: string) {
    const { data: session } = await supabase
      .from('employee_focus_sessions')
      .select('interruptions_count')
      .eq('id', id)
      .single();

    if (!session) return;

    const { data, error } = await supabase
      .from('employee_focus_sessions')
      .update({
        interruptions_count: session.interruptions_count + 1,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFocusSessions(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('employee_focus_sessions')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getFocusStats(days: number = 30) {
    const sessions = await this.getFocusSessions(days);

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: 0,
      averageQuality: 0,
      totalInterruptions: 0,
      completionRate: 0,
    };

    let qualitySum = 0;
    let qualityCount = 0;
    let completedSessions = 0;

    sessions.forEach((session) => {
      if (session.actual_duration_minutes) {
        stats.totalMinutes += session.actual_duration_minutes;
      }
      stats.totalInterruptions += session.interruptions_count;

      if (session.quality_score) {
        qualitySum += session.quality_score;
        qualityCount++;
      }

      if (session.ended_at) {
        completedSessions++;
      }
    });

    stats.averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0;
    stats.completionRate = stats.totalSessions > 0 ? (completedSessions / stats.totalSessions) * 100 : 0;

    return stats;
  },
};
