import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Friction = Database['public']['Tables']['frictions']['Row'];
type FrictionInsert = Database['public']['Tables']['frictions']['Insert'];
type FrictionUpdate = Database['public']['Tables']['frictions']['Update'];

export const frictionsService = {
  async getFrictions(userId: string) {
    const { data, error } = await supabase
      .from('frictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUnresolvedFrictions(userId: string) {
    const { data, error } = await supabase
      .from('frictions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_resolved', false)
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFrictionsByTool(userId: string, toolName: string) {
    const { data, error } = await supabase
      .from('frictions')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createFriction(friction: FrictionInsert) {
    const { data, error } = await supabase
      .from('frictions')
      .insert(friction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resolveFriction(frictionId: string) {
    const { data, error } = await supabase
      .from('frictions')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', frictionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unresolveFriction(frictionId: string) {
    const { data, error } = await supabase
      .from('frictions')
      .update({
        is_resolved: false,
        resolved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', frictionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFriction(frictionId: string) {
    const { error } = await supabase
      .from('frictions')
      .delete()
      .eq('id', frictionId);

    if (error) throw error;
  },

  async getFrictionStats(userId: string) {
    const frictions = await this.getFrictions(userId);

    const stats = {
      total: frictions.length,
      unresolved: frictions.filter(f => !f.is_resolved).length,
      resolved: frictions.filter(f => f.is_resolved).length,
      bySeverity: {
        high: frictions.filter(f => f.severity === 'high' && !f.is_resolved).length,
        medium: frictions.filter(f => f.severity === 'medium' && !f.is_resolved).length,
        low: frictions.filter(f => f.severity === 'low' && !f.is_resolved).length,
      },
      byTool: frictions.reduce((acc, f) => {
        if (!f.is_resolved) {
          acc[f.tool_name] = (acc[f.tool_name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },
};
