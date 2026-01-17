import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Activity, Zap } from 'lucide-react';
import { timeTrackingService } from '../../services/timeTrackingService';

export const TimeIntelligenceWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await timeTrackingService.getTimeStats('current-user', timeRange);
      setStats(data);
    } catch (error) {
      console.error('Error loading time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const getTopTools = () => {
    if (!stats) return [];
    return Object.entries(stats.byTool)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3);
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
        <h3 className="text-lg font-semibold text-slate-900">Time Intelligence</h3>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeRange === 7
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7j
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeRange === 30
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30j
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Clock size={18} />
                <span className="text-sm font-medium">Temps Total</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatHours(stats.totalMinutes)}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Zap size={18} />
                <span className="text-sm font-medium">Energie Moy.</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.averageEnergyLevel.toFixed(1)}/5
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Activity size={16} />
              Top Outils
            </h4>
            <div className="space-y-2">
              {getTopTools().map(([tool, minutes]: any, index) => {
                const percentage = (minutes / stats.totalMinutes) * 100;
                const colors = [
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-pink-500',
                ];

                return (
                  <div key={tool}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{tool}</span>
                      <span className="text-slate-500">{formatHours(minutes)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Par Type d'Activité
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats.byActivityType).map(([type, minutes]: any) => {
                const activityLabels: Record<string, { label: string; color: string }> = {
                  focus: { label: 'Focus', color: 'bg-blue-100 text-blue-700' },
                  meeting: { label: 'Réunions', color: 'bg-purple-100 text-purple-700' },
                  communication: { label: 'Communication', color: 'bg-green-100 text-green-700' },
                  break: { label: 'Pauses', color: 'bg-orange-100 text-orange-700' },
                };

                const config = activityLabels[type] || { label: type, color: 'bg-slate-100 text-slate-700' };

                return (
                  <div key={type} className={`${config.color} rounded-lg p-3`}>
                    <div className="text-xs font-medium mb-1">{config.label}</div>
                    <div className="text-lg font-bold">{formatHours(minutes)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Voir l'analyse détaillée
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
