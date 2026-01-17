import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface OKRItem {
  id: string;
  title: string;
  status: 'critical' | 'warning' | 'success';
  progress: number;
  description: string;
}

const okrs: OKRItem[] = [
  {
    id: '1',
    title: '1. Lancement V2',
    status: 'critical',
    progress: 42,
    description: 'Critique - En Retard',
  },
  {
    id: '2',
    title: '2. Chiffre d\'Affaires Q1',
    status: 'success',
    progress: 112,
    description: '+12% au-dessus de l\'objectif',
  },
  {
    id: '3',
    title: '3. Recrutement Tech',
    status: 'warning',
    progress: 67,
    description: '2/3 postes pourvus',
  },
];

export const OKRWidget = () => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: AlertTriangle,
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          icon: TrendingUp,
        };
      case 'success':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          icon: Target,
        };
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          icon: Target,
        };
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Objectifs Stratégiques</h3>
          <p className="text-sm text-slate-400">OKRs T4 2025</p>
        </div>
      </div>

      <div className="space-y-4">
        {okrs.map((okr) => {
          const config = getStatusConfig(okr.status);
          const StatusIcon = config.icon;

          return (
            <div
              key={okr.id}
              className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <h4 className="text-white font-semibold">{okr.title}</h4>
                  </div>
                  <p className={`text-sm ${config.color}`}>{okr.description}</p>
                </div>
                <span
                  className={`text-2xl font-bold ${config.color} flex-shrink-0 ml-4`}
                >
                  {okr.progress}%
                </span>
              </div>

              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                    okr.status === 'critical'
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : okr.status === 'warning'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}
                  style={{ width: `${Math.min(okr.progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progrès global</span>
          <span className="text-white font-semibold">
            {Math.round((okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length))}%
          </span>
        </div>
      </div>
    </div>
  );
};
