import { supabase } from '../lib/supabase';

export interface KnowledgeItem {
  id: string;
  user_id: string;
  type: 'note' | 'snippet' | 'bookmark';
  title: string;
  content?: string;
  tags: string[];
  is_public: boolean;
  language?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export const knowledgeBaseService = {
  async createItem(data: {
    type: KnowledgeItem['type'];
    title: string;
    content?: string;
    tags?: string[];
    is_public?: boolean;
    language?: string;
    url?: string;
  }) {
    const { data: item, error } = await supabase
      .from('employee_knowledge_base')
      .insert({
        ...data,
        tags: data.tags || [],
        is_public: data.is_public || false,
      })
      .select()
      .single();

    if (error) throw error;
    return item;
  },

  async updateItem(id: string, updates: Partial<KnowledgeItem>) {
    const { data, error } = await supabase
      .from('employee_knowledge_base')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('employee_knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getItems(type?: KnowledgeItem['type'], includePublic: boolean = false) {
    let query = supabase
      .from('employee_knowledge_base')
      .select('*')
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async searchItems(searchTerm: string) {
    const { data, error } = await supabase
      .from('employee_knowledge_base')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getItemsByTag(tag: string) {
    const { data, error } = await supabase
      .from('employee_knowledge_base')
      .select('*')
      .contains('tags', [tag])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPublicItems() {
    const { data, error } = await supabase
      .from('employee_knowledge_base')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
