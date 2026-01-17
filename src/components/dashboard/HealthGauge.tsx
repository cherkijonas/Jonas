import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { AnimatedHealthScore } from './AnimatedHealthScore';
import { useApp } from '../../context/AppContext';

interface HealthGaugeProps {
  score: number;
  onClick?: () => void;
}

export const HealthGauge = ({ score, onClick }: HealthGaugeProps) => {
  const { healthScore, scoreIncreased } = useApp();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = healthScore / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayScore(Math.min(Math.round(stepValue * currentStep), healthScore));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [healthScore]);

  const getHealthColor = () => {
    if (healthScore === 0) return { stroke: 'stroke-slate-600', glow: 'shadow-slate-500/20', text: 'text-slate-400' };
    if (healthScore === 50) return { stroke: 'stroke-slate-500', glow: 'shadow-slate-500/20', text: 'text-slate-400' };
    if (healthScore < 50) return { stroke: 'stroke-red-500', glow: 'shadow-red-500/30', text: 'text-red-400' };
    if (healthScore < 75) return { stroke: 'stroke-yellow-500', glow: 'shadow-yellow-500/30', text: 'text-yellow-400' };
    return { stroke: 'stroke-green-500', glow: 'shadow-green-500/30', text: 'text-green-400' };
  };

  const colors = getHealthColor();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-cyan-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-cyan-400" size={24} />
        <h3 className="text-xl font-semibold text-white">Score de Santé</h3>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="transform -rotate-90" width="200" height="200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={`${colors.stroke} transition-all duration-1000 ease-out`}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px currentColor)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedHealthScore score={healthScore} scoreIncreased={scoreIncreased} />
            <span className="text-slate-400 text-sm mt-1">sur 100</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Statut</span>
          <span className={`font-semibold ${colors.text}`}>
            {healthScore === 0 ? 'Non Connecté' : healthScore === 50 ? 'Neutre' : healthScore < 50 ? 'Critique' : healthScore < 75 ? 'Moyen' : 'Excellent'}
          </span>
        </div>
      </div>
    </div>
  );
};
