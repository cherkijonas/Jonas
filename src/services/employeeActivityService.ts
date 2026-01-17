import { supabase } from '../lib/supabase';

export interface EmployeeActivity {
  id: string;
  user_id: string;
  activity_type: 'achievement' | 'milestone' | 'streak' | 'productivity';
  title: string;
  description: string;
  metadata?: {
    tool_name?: string;
    metric_value?: number;
    metric_unit?: string;
    comparison?: string;
    [key: string]: any;
  };
  icon: string;
  color: string;
  created_at: string;
}

export const employeeActivityService = {
  async getActivities(userId: string, limit: number = 10): Promise<EmployeeActivity[]> {
    const { data, error } = await supabase
      .from('employee_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    return data || [];
  },

  async getRecentActivities(userId: string, hours: number = 48): Promise<EmployeeActivity[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const { data, error } = await supabase
      .from('employee_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }

    return data || [];
  },

  async createActivity(activity: Omit<EmployeeActivity, 'id' | 'created_at'>): Promise<EmployeeActivity> {
    const { data, error } = await supabase
      .from('employee_activities')
      .insert([activity])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }

    return data;
  },

  async getActivitiesByType(
    userId: string,
    type: EmployeeActivity['activity_type']
  ): Promise<EmployeeActivity[]> {
    const { data, error } = await supabase
      .from('employee_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', type)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching activities by type:', error);
      throw error;
    }

    return data || [];
  },

  async getActivityStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    thisWeek: number;
    thisMonth: number;
  }> {
    const { data, error } = await supabase
      .from('employee_activities')
      .select('activity_type, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }

    const activities = data || [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    let thisWeek = 0;
    let thisMonth = 0;

    activities.forEach((activity) => {
      byType[activity.activity_type] = (byType[activity.activity_type] || 0) + 1;

      const createdAt = new Date(activity.created_at);
      if (createdAt >= weekAgo) thisWeek++;
      if (createdAt >= monthAgo) thisMonth++;
    });

    return {
      total: activities.length,
      byType,
      thisWeek,
      thisMonth,
    };
  },

  async deleteActivity(activityId: string): Promise<void> {
    const { error } = await supabase
      .from('employee_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },
};
