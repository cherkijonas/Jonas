import React, { useState, useEffect } from 'react';
import { Battery, Sun, Moon, Zap, Coffee } from 'lucide-react';
import { timeTrackingService } from '../../services/timeTrackingService';

export const EnergyManagementWidget: React.FC = () => {
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [currentEnergy, setCurrentEnergy] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    try {
      setLoading(true);
      const stats = await timeTrackingService.getTimeStats('current-user', 7);
      setCurrentEnergy(Math.round(stats.averageEnergyLevel || 3));
    } catch (error) {
      console.error('Error loading energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyColor = (level: number) => {
    if (level >= 4) return 'from-emerald-400 to-green-500';
    if (level >= 3) return 'from-yellow-400 to-amber-500';
    return 'from-orange-400 to-red-500';
  };

  const getEnergyIcon = (level: number) => {
    if (level >= 4) return <Zap className="text-emerald-600" size={24} />;
    if (level >= 3) return <Sun className="text-amber-600" size={24} />;
    return <Coffee className="text-orange-600" size={24} />;
  };

  const getEnergyText = (level: number) => {
    if (level >= 4) return 'Energie élevée';
    if (level >= 3) return 'Energie normale';
    return 'Energie faible';
  };

  const getRecommendations = (level: number) => {
    if (level >= 4) {
      return [
        'Parfait pour des tâches complexes',
        'Moment idéal pour du deep work',
        'Profitez de votre pic d\'énergie',
      ];
    }
    if (level >= 3) {
      return [
        'Bon pour des tâches modérées',
        'Alternez entre focus et communication',
        'Maintenez votre rythme',
      ];
    }
    return [
      'Prenez une pause',
      'Faites des tâches simples',
      'Hydratez-vous et bougez',
    ];
  };

  const peakHours = [
    { time: '9h-11h', energy: 4, label: 'Matin' },
    { time: '11h-13h', energy: 3, label: 'Midi' },
    { time: '14h-16h', energy: 2, label: 'Après-midi' },
    { time: '16h-18h', energy: 3, label: 'Fin de journée' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Battery size={20} className="text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Gestion d'Energie</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getEnergyIcon(currentEnergy)}
            <div>
              <p className="font-semibold text-slate-900">{getEnergyText(currentEnergy)}</p>
              <p className="text-sm text-slate-500">Niveau actuel: {currentEnergy}/5</p>
            </div>
          </div>
        </div>

        <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getEnergyColor(currentEnergy)} transition-all duration-500`}
            style={{ width: `${(currentEnergy / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Courbe d'énergie journalière</h4>
        <div className="space-y-2">
          {peakHours.map((hour, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-20">{hour.time}</span>
              <div className="flex-1">
                <div className="w-full bg-slate-100 rounded-full h-6 flex items-center">
                  <div
                    className={`h-6 rounded-full bg-gradient-to-r ${getEnergyColor(hour.energy)} transition-all`}
                    style={{ width: `${(hour.energy / 5) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500 w-16 text-right">{hour.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
          <Sun size={16} className="text-blue-600" />
          Recommandations
        </h4>
        <ul className="space-y-1">
          {getRecommendations(currentEnergy).map((rec, index) => (
            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Analyser mes patterns d'énergie
        </button>
      </div>
    </div>
  );
};
