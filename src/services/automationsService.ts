import { supabase } from '../lib/supabase';

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  is_active: boolean;
  run_count: number;
  last_run_at?: string;
  created_at: string;
}

export const automationsService = {
  async createAutomation(data: {
    name: string;
    description?: string;
    trigger_type: string;
    trigger_config?: Record<string, any>;
    actions?: Array<any>;
  }) {
    const { data: automation, error } = await supabase
      .from('employee_automations')
      .insert({
        ...data,
        trigger_config: data.trigger_config || {},
        actions: data.actions || [],
        is_active: true,
        run_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return automation;
  },

  async updateAutomation(id: string, updates: Partial<Automation>) {
    const { data, error } = await supabase
      .from('employee_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleAutomation(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('employee_automations')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAutomation(id: string) {
    const { error } = await supabase
      .from('employee_automations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAutomations() {
    const { data, error } = await supabase
      .from('employee_automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async incrementRunCount(id: string) {
    const { data: automation } = await supabase
      .from('employee_automations')
      .select('run_count')
      .eq('id', id)
      .single();

    if (!automation) return;

    const { data, error } = await supabase
      .from('employee_automations')
      .update({
        run_count: automation.run_count + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getAutomationTemplates() {
    return [
      {
        name: 'Email vers Tâche',
        description: 'Créer automatiquement une tâche quand vous recevez un email important',
        trigger_type: 'email_received',
        trigger_config: { filter: 'important' },
        actions: [
          { type: 'create_task', config: { tool: 'trello' } },
        ],
      },
      {
        name: 'Nouveau Projet Setup',
        description: 'Créer automatiquement un board Trello, channel Slack et page Notion',
        trigger_type: 'manual',
        trigger_config: {},
        actions: [
          { type: 'create_trello_board', config: {} },
          { type: 'create_slack_channel', config: {} },
          { type: 'create_notion_page', config: {} },
        ],
      },
      {
        name: 'Rapport Hebdomadaire',
        description: 'Générer et envoyer un rapport de vos activités chaque vendredi',
        trigger_type: 'schedule',
        trigger_config: { day: 'friday', time: '17:00' },
        actions: [
          { type: 'generate_report', config: {} },
          { type: 'send_email', config: {} },
        ],
      },
      {
        name: 'Sync Calendar',
        description: 'Synchroniser vos événements entre Google Calendar et Outlook',
        trigger_type: 'calendar_event',
        trigger_config: { source: 'google' },
        actions: [
          { type: 'create_calendar_event', config: { target: 'outlook' } },
        ],
      },
    ];
  },
};
