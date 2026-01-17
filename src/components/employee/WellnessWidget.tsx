import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { wellnessService } from '../../services/wellnessService';

export const WellnessWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [formData, setFormData] = useState({
    mood_score: 3,
    stress_level: 3,
    energy_level: 3,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, checkin] = await Promise.all([
        wellnessService.getWellnessStats(30),
        wellnessService.getTodayCheckin(),
      ]);
      setStats(statsData);
      setTodayCheckin(checkin);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (todayCheckin) {
        await wellnessService.updateCheckin(today, formData);
      } else {
        await wellnessService.createCheckin({ date: today, ...formData });
      }
      await loadData();
      setShowCheckinForm(false);
    } catch (error) {
      console.error('Error saving checkin:', error);
    }
  };

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getBurnoutIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'medium':
        return <AlertTriangle size={20} className="text-amber-600" />;
      default:
        return <CheckCircle size={20} className="text-emerald-600" />;
    }
  };

  const getBurnoutText = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'Risque élevé de burnout';
      case 'medium':
        return 'Risque modéré de burnout';
      default:
        return 'Pas de risque de burnout';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-rose-500" />
          <h3 className="text-lg font-semibold text-slate-900">Bien-être</h3>
        </div>
        {!todayCheckin && (
          <button
            onClick={() => setShowCheckinForm(!showCheckinForm)}
            className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-200 transition-colors"
          >
            Check-in du jour
          </button>
        )}
      </div>

      {showCheckinForm && (
        <div className="mb-6 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Humeur: {formData.mood_score}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.mood_score}
              onChange={(e) => setFormData({ ...formData, mood_score: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Triste</span>
              <span>Neutre</span>
              <span>Heureux</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stress: {formData.stress_level}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.stress_level}
              onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Calme</span>
              <span>Stressé</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Energie: {formData.energy_level}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Fatigué</span>
              <span>Énergique</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCheckin}
              className="flex-1 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setShowCheckinForm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg flex items-center gap-3 ${getBurnoutColor(stats.burnoutRisk)}`}>
            {getBurnoutIcon(stats.burnoutRisk)}
            <div className="flex-1">
              <p className="font-medium">{getBurnoutText(stats.burnoutRisk)}</p>
              <p className="text-xs mt-1">Basé sur vos 30 derniers jours</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{stats.averageMood.toFixed(1)}</div>
              <div className="text-xs text-slate-600 mt-1">Humeur moy.</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{stats.averageStress.toFixed(1)}</div>
              <div className="text-xs text-slate-600 mt-1">Stress moy.</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{stats.averageEnergy.toFixed(1)}</div>
              <div className="text-xs text-slate-600 mt-1">Energie moy.</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Heures de travail</span>
              <span className="font-semibold text-slate-900">
                {stats.averageWorkHours.toFixed(1)}h/jour
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.averageWorkHours > 9 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min((stats.averageWorkHours / 12) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Recommandé: 7-8h par jour
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp size={16} className="text-blue-600" />
            <span>Pauses prises: {stats.totalBreaks} sur les 30 derniers jours</span>
          </div>
        </div>
      )}
    </div>
  );
};
