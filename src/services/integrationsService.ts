import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Integration = Database['public']['Tables']['integrations']['Row'];
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert'];
type IntegrationUpdate = Database['public']['Tables']['integrations']['Update'];

export const integrationsService = {
  async getIntegrations(teamId?: string | null, userId?: string) {
    if (teamId) {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } else if (userId) {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .is('team_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
    return [];
  },

  async getIntegrationByTool(toolName: string, teamId?: string | null, userId?: string) {
    if (teamId) {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('team_id', teamId)
        .eq('tool_name', toolName)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else if (userId) {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .is('team_id', null)
        .eq('tool_name', toolName)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
    return null;
  },

  async createIntegration(integration: IntegrationInsert) {
    const { data, error } = await supabase
      .from('integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIntegration(id: string, updates: IntegrationUpdate) {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteIntegration(id: string) {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async connectIntegration(toolName: string, config: any = {}, teamId?: string | null, userId?: string) {
    const existing = await this.getIntegrationByTool(toolName, teamId, userId);

    const integrationData: any = {
      tool_name: toolName,
      status: 'connected',
      config,
      last_sync: new Date().toISOString(),
    };

    if (teamId) {
      integrationData.team_id = teamId;
    } else if (userId) {
      integrationData.user_id = userId;
    }

    if (existing) {
      return this.updateIntegration(existing.id, {
        status: 'connected',
        config,
        last_sync: new Date().toISOString(),
      });
    } else {
      return this.createIntegration(integrationData);
    }
  },

  async disconnectIntegration(toolName: string, teamId?: string | null, userId?: string) {
    const existing = await this.getIntegrationByTool(toolName, teamId, userId);

    if (existing) {
      return this.updateIntegration(existing.id, {
        status: 'disconnected',
      });
    }
  },
};
