import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { timeTrackingService } from '../../services/timeTrackingService';

export const TimeHeatmapWidget: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const data = await timeTrackingService.getHeatmapData('current-user', 14);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100';
    if (minutes < 30) return 'bg-emerald-200';
    if (minutes < 60) return 'bg-emerald-400';
    if (minutes < 120) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Object.keys(heatmapData).slice(-7);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Heatmap d'Activité</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {days.map((date) => {
            const dayData = heatmapData[date] || {};
            const dayName = new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' });

            return (
              <div key={date} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-8 text-right">{dayName}</span>
                <div className="flex gap-1 flex-1">
                  {hours.map((hour) => {
                    const minutes = dayData[hour] || 0;
                    return (
                      <div
                        key={hour}
                        className={`flex-1 h-4 rounded-sm ${getIntensityColor(minutes)} hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer group relative`}
                        title={`${hour}h: ${minutes}min`}
                      >
                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {hour}h: {minutes}min
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Moins</span>
            <div className="flex gap-1">
              {[0, 30, 60, 120, 180].map((minutes) => (
                <div
                  key={minutes}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(minutes)}`}
                />
              ))}
            </div>
            <span>Plus</span>
          </div>
          <span className="text-xs text-slate-500">7 derniers jours</span>
        </div>
      </div>
    </div>
  );
};
