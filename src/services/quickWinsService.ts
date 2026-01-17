import { supabase } from '../lib/supabase';

export interface QuickWin {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  estimated_minutes: number;
  status: 'pending' | 'completed' | 'skipped';
  completed_at?: string;
  created_at: string;
}

export const quickWinsService = {
  async createQuickWin(data: {
    title: string;
    description?: string;
    estimated_minutes: number;
  }) {
    const { data: quickWin, error } = await supabase
      .from('employee_quick_wins')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return quickWin;
  },

  async getQuickWins(status?: QuickWin['status']) {
    let query = supabase
      .from('employee_quick_wins')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async completeQuickWin(id: string) {
    const { data, error } = await supabase
      .from('employee_quick_wins')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async skipQuickWin(id: string) {
    const { data, error } = await supabase
      .from('employee_quick_wins')
      .update({ status: 'skipped' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuickWin(id: string) {
    const { error } = await supabase
      .from('employee_quick_wins')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStreakDays() {
    const { data, error } = await supabase
      .from('employee_quick_wins')
      .select('completed_at')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedDates = new Set(
      data?.map((w) => {
        const date = new Date(w.completed_at!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }) || []
    );

    let checkDate = new Date(today);
    while (completedDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  },

  async getDailyQuickWins(): Promise<QuickWin[]> {
    const suggestions: QuickWin[] = [
      {
        id: 'temp-1',
        user_id: '',
        title: 'Organiser votre boîte email',
        description: 'Archiver les emails traités, répondre aux urgents',
        estimated_minutes: 5,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 'temp-2',
        user_id: '',
        title: 'Mettre à jour votre statut d\'équipe',
        description: 'Partager ce sur quoi vous travaillez aujourd\'hui',
        estimated_minutes: 2,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 'temp-3',
        user_id: '',
        title: 'Revoir une PR en attente',
        description: 'Débloquer un collègue en revoyant son code',
        estimated_minutes: 10,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ];

    return suggestions;
  },
};
