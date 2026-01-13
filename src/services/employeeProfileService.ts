import { supabase } from '../lib/supabase';

export const employeeProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getConnectedTools(userId: string) {
    const profile = await this.getProfile(userId);
    if (!profile) return [];

    const tools = profile.connected_tools as any;
    return Array.isArray(tools) ? tools : [];
  },

  async connectTool(userId: string, toolId: string) {
    const connectedTools = await this.getConnectedTools(userId);

    if (connectedTools.includes(toolId)) {
      const { data: existingIntegration } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('tool_id', toolId)
        .maybeSingle();

      return existingIntegration;
    }

    const updatedTools = [...connectedTools, toolId];

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        connected_tools: updatedTools,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .insert({
        user_id: userId,
        tool_id: toolId,
        tool_name: toolId,
        status: 'connected',
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (integrationError) throw integrationError;

    return integration;
  },

  async disconnectTool(userId: string, toolId: string) {
    const connectedTools = await this.getConnectedTools(userId);
    const updatedTools = connectedTools.filter((id: string) => id !== toolId);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        connected_tools: updatedTools,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data.connected_tools;
  },

  async getHealthScore(userId: string) {
    const profile = await this.getProfile(userId);
    return profile?.health_score || 0;
  },

  async refreshHealthScore(userId: string) {
    const { data, error } = await supabase.rpc('calculate_health_score', {
      p_user_id: userId,
    });

    if (error) throw error;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ health_score: data })
      .eq('id', userId);

    if (updateError) throw updateError;

    return data;
  },

  async updateLastActivity(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  },
};
