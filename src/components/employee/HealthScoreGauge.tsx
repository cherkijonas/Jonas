import { motion } from 'framer-motion';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface HealthScoreGaugeProps {
  score: number;
  connectedToolsCount: number;
}

export const HealthScoreGauge = ({ score, connectedToolsCount }: HealthScoreGaugeProps) => {
  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 61) return '#00FF88';
    if (currentScore >= 31) return '#FF8C00';
    return '#FF3333';
  };

  const getScoreLabel = (currentScore: number) => {
    if (currentScore >= 61) return 'Excellent';
    if (currentScore >= 31) return 'Moyen';
    return 'Faible';
  };

  const getScoreIcon = (currentScore: number) => {
    if (currentScore >= 61) return TrendingUp;
    if (currentScore >= 31) return Zap;
    return AlertTriangle;
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const Icon = getScoreIcon(score);

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-8">
      <div className="relative w-80 h-80">
        <svg
          className="transform -rotate-90"
          width="320"
          height="320"
          viewBox="0 0 320 320"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <circle
            cx="160"
            cy="160"
            r="120"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="24"
            fill="none"
          />

          <motion.circle
            cx="160"
            cy="160"
            r="120"
            stroke="url(#scoreGradient)"
            strokeWidth="24"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            filter="url(#glow)"
            style={{
              filter: `drop-shadow(0 0 12px ${color})`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: `${color}20`,
                boxShadow: `0 0 24px ${color}40`,
              }}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="text-7xl font-bold text-white mb-2">
                {score}
                <span className="text-4xl text-slate-400">%</span>
              </div>
              <div
                className="text-lg font-semibold mb-1"
                style={{ color }}
              >
                {label}
              </div>
              <div className="text-sm text-slate-400">
                {connectedToolsCount === 0 && 'Aucun outil connecté'}
                {connectedToolsCount === 1 && '1 outil connecté'}
                {connectedToolsCount > 1 && `${connectedToolsCount} outils connectés`}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {score === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 px-6 py-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl max-w-md text-center"
        >
          <p className="text-sm text-slate-300">
            Connectez vos premiers outils pour commencer à suivre votre santé opérationnelle
          </p>
        </motion.div>
      )}

      {score > 0 && score < 50 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 px-6 py-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl max-w-md text-center"
        >
          <p className="text-sm text-slate-300">
            Connectez plus d'outils pour améliorer votre score de santé
          </p>
        </motion.div>
      )}

      {score >= 61 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl max-w-md text-center"
        >
          <p className="text-sm text-slate-300">
            Excellent travail! Votre écosystème d'outils est bien intégré
          </p>
        </motion.div>
      )}
    </div>
  );
};
