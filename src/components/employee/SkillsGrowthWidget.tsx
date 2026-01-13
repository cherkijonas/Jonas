import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Star, Plus, X } from 'lucide-react';
import { skillsService, Skill } from '../../services/skillsService';

export const SkillsGrowthWidget: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await skillsService.getSkills();
      setSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'bg-emerald-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getLevelText = (level: number) => {
    if (level >= 5) return 'Expert';
    if (level >= 4) return 'Avancé';
    if (level >= 3) return 'Intermédiaire';
    if (level >= 2) return 'Débutant';
    return 'Novice';
  };

  const getXPForNextLevel = (currentXP: number) => {
    const currentLevel = Math.floor(currentXP / 1000) + 1;
    return currentLevel * 1000;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900">Compétences</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award size={32} className="text-amber-600" />
          </div>
          <p className="text-slate-600 font-medium">Aucune compétence</p>
          <p className="text-sm text-slate-500 mt-1">Ajoutez vos compétences pour suivre votre progression</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.slice(0, 5).map((skill) => {
            const nextLevelXP = getXPForNextLevel(skill.experience_points);
            const progress = ((skill.experience_points % 1000) / 1000) * 100;

            return (
              <div key={skill.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{skill.skill_name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getLevelColor(skill.proficiency_level)}`}>
                        Lvl {skill.proficiency_level}
                      </span>
                    </div>
                    {skill.category && (
                      <p className="text-xs text-slate-500">{skill.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-medium">{skill.experience_points} XP</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{getLevelText(skill.proficiency_level)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getLevelColor(skill.proficiency_level)} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {1000 - (skill.experience_points % 1000)} XP jusqu'au niveau {skill.proficiency_level + 1}
                  </p>
                </div>

                {skill.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.tools_used.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {skills.length > 5 && (
            <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Voir toutes les compétences ({skills.length})
            </button>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingUp size={16} className="text-emerald-600" />
            <span>Total XP: {skills.reduce((sum, s) => sum + s.experience_points, 0)}</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Learning Path
          </button>
        </div>
      </div>
    </div>
  );
};
