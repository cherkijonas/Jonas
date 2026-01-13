import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileText,
  Zap,
  Users,
  Activity,
} from 'lucide-react';
import { employeeMetricsService } from '../../services/employeeMetricsService';

interface EmployeeMetricsWidgetProps {
  userId: string;
}

export const EmployeeMetricsWidget = ({ userId }: EmployeeMetricsWidgetProps) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [userId]);

  const loadMetrics = async () => {
    try {
      const data = await employeeMetricsService.getOrCreateMetrics(userId);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const stats = [
    {
      label: 'Demandes Soumises',
      value: metrics.requests_submitted || 0,
      icon: FileText,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'Demandes Approuvées',
      value: metrics.requests_approved || 0,
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Outils Connectés',
      value: metrics.integrations_connected || 0,
      icon: Zap,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Score d\'Activité',
      value: metrics.activity_score || 0,
      icon: TrendingUp,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Vos Métriques</h2>
          <p className="text-sm text-slate-400">Performance personnelle</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 bg-gradient-to-br ${stat.gradient} bg-opacity-20 rounded-lg`}>
                  <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {metrics.activity_score > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Progression</span>
            <span className="text-sm font-semibold text-cyan-400">{metrics.activity_score}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(metrics.activity_score, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
