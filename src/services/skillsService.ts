import { supabase } from '../lib/supabase';

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  category?: string;
  proficiency_level: number;
  experience_points: number;
  tools_used: string[];
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export const skillsService = {
  async addSkill(data: {
    skill_name: string;
    category?: string;
    proficiency_level?: number;
    tools_used?: string[];
  }) {
    const { data: skill, error } = await supabase
      .from('employee_skills')
      .insert({
        ...data,
        experience_points: 0,
        tools_used: data.tools_used || [],
        last_used_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return skill;
  },

  async updateSkill(skillName: string, updates: Partial<Skill>) {
    const { data, error } = await supabase
      .from('employee_skills')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('skill_name', skillName)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addExperiencePoints(skillName: string, points: number) {
    const { data: skill } = await supabase
      .from('employee_skills')
      .select('experience_points, proficiency_level')
      .eq('skill_name', skillName)
      .single();

    if (!skill) return;

    const newXP = skill.experience_points + points;
    let newLevel = skill.proficiency_level;

    if (newXP >= 1000 && newLevel < 5) {
      newLevel = Math.min(5, Math.floor(newXP / 1000) + 1);
    }

    const { data, error } = await supabase
      .from('employee_skills')
      .update({
        experience_points: newXP,
        proficiency_level: newLevel,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('skill_name', skillName)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSkills() {
    const { data, error } = await supabase
      .from('employee_skills')
      .select('*')
      .order('experience_points', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSkillsByCategory(category: string) {
    const { data, error } = await supabase
      .from('employee_skills')
      .select('*')
      .eq('category', category)
      .order('proficiency_level', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteSkill(skillName: string) {
    const { error } = await supabase
      .from('employee_skills')
      .delete()
      .eq('skill_name', skillName);

    if (error) throw error;
  },

  async getSkillsMap() {
    const skills = await this.getSkills();

    const categories: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      const cat = skill.category || 'Autres';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(skill);
    });

    return categories;
  },
};
