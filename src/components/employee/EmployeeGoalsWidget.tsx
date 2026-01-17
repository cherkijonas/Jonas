import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { employeeGoalsService } from '../../services/employeeGoalsService';

interface EmployeeGoalsWidgetProps {
  userId: string;
}

export const EmployeeGoalsWidget = ({ userId }: EmployeeGoalsWidgetProps) => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
  });

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      const data = await employeeGoalsService.getActiveGoals(userId);
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      await employeeGoalsService.createGoal({
        user_id: userId,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        target_date: newGoal.target_date || null,
        progress: 0,
        status: 'active',
      });

      setShowAddModal(false);
      setNewGoal({ title: '', description: '', category: 'personal', target_date: '' });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      await employeeGoalsService.updateGoalProgress(goalId, newProgress);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-lg">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mes Objectifs</h2>
              <p className="text-sm text-slate-400">{goals.length} actifs</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg transition-all text-violet-400"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-2">Aucun objectif actif</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Créer votre premier objectif
              </button>
            </div>
          ) : (
            goals.slice(0, 3).map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
                  {goal.progress >= 100 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </div>

                {goal.target_date && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(goal.target_date).toLocaleDateString('fr-FR')}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progression</span>
                    <span className="text-violet-400 font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {goals.length > 3 && (
          <button className="w-full mt-4 py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            Voir tous les objectifs ({goals.length})
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Nouvel Objectif</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Ex: Maîtriser React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Décrivez votre objectif..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date Cible
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={!newGoal.title.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
