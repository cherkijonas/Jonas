import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Flame, Clock } from 'lucide-react';
import { quickWinsService, QuickWin } from '../../services/quickWinsService';

export const QuickWinsWidget: React.FC = () => {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [streak, setStreak] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWin, setNewWin] = useState({ title: '', estimated_minutes: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wins, streakDays] = await Promise.all([
        quickWinsService.getQuickWins('pending'),
        quickWinsService.getStreakDays(),
      ]);
      setQuickWins(wins.slice(0, 5));
      setStreak(streakDays);
    } catch (error) {
      console.error('Error loading quick wins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await quickWinsService.completeQuickWin(id);
      setQuickWins((prev) => prev.filter((w) => w.id !== id));
      setStreak((prev) => prev + 1);
    } catch (error) {
      console.error('Error completing quick win:', error);
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await quickWinsService.skipQuickWin(id);
      setQuickWins((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Error skipping quick win:', error);
    }
  };

  const handleAdd = async () => {
    if (!newWin.title.trim()) return;

    try {
      const win = await quickWinsService.createQuickWin(newWin);
      setQuickWins((prev) => [win, ...prev]);
      setNewWin({ title: '', estimated_minutes: 5 });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating quick win:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Quick Wins</h3>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
              <Flame size={16} className="text-orange-600" />
              <span className="text-sm font-bold text-orange-700">{streak} jours</span>
            </div>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Titre de la tâche..."
            value={newWin.title}
            onChange={(e) => setNewWin({ ...newWin, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={newWin.estimated_minutes}
              onChange={(e) => setNewWin({ ...newWin, estimated_minutes: parseInt(e.target.value) })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 min</option>
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
            </select>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {quickWins.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check size={32} className="text-emerald-600" />
          </div>
          <p className="text-slate-600 font-medium">Aucune tâche rapide</p>
          <p className="text-sm text-slate-500 mt-1">Toutes vos quick wins sont terminées!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quickWins.map((win) => (
            <div
              key={win.id}
              className="group flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <button
                onClick={() => handleComplete(win.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{win.title}</p>
                {win.description && (
                  <p className="text-xs text-slate-500 truncate">{win.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{win.estimated_minutes}m</span>
                </div>
                <button
                  onClick={() => handleSkip(win.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Les tâches rapides boostent votre productivité et votre moral
        </p>
      </div>
    </div>
  );
};
