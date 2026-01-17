import { Activity, RefreshCw, TrendingUp, CheckCircle2, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../../context/GlobalContext';
import { getIntegrationIcon } from '../../data/enterpriseIntegrations';

interface ActivityFeedItem {
  id: string;
  type: 'scan' | 'trend' | 'win' | 'note';
  message: string;
  tool?: string;
  timestamp: string;
}

export const InsightFeed = () => {
  const { activityFeed } = useGlobal();

  const getTypeConfig = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'scan':
        return {
          icon: RefreshCw,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          label: 'SCAN',
        };
      case 'trend':
        return {
          icon: TrendingUp,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20',
          label: 'TENDANCE',
        };
      case 'win':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          label: 'SUCCÈS',
        };
      case 'note':
        return {
          icon: StickyNote,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          label: 'NOTE',
        };
      default:
        return {
          icon: Activity,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: 'INFO',
        };
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <Activity className="text-cyan-400" size={22} />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Activité Système en Direct</h3>
          <p className="text-xs text-slate-500">
            Surveillance continue • {activityFeed.length} événements
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activityFeed.length > 0 ? (
          <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent space-y-2">
            {activityFeed.map((item, index) => {
              const config = getTypeConfig(item.type);
              const TypeIcon = config.icon;
              const toolData = item.tool ? getIntegrationIcon(item.tool) : null;
              const ToolIcon = toolData?.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-slate-900/30 border ${config.border} rounded-lg p-3 hover:bg-slate-800/40 transition-all duration-200`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${config.bg} ${config.color} p-1.5 rounded-lg flex-shrink-0 mt-0.5`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${config.color} tracking-wide`}>
                          {config.label}
                        </span>
                        {item.tool && toolData && ToolIcon && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded">
                            <ToolIcon className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400 font-medium">
                              {item.tool}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-slate-600 ml-auto flex-shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-snug">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className={`w-14 h-14 bg-gradient-to-br ${isDemoMode ? 'from-emerald-500/20 to-cyan-600/20' : 'from-slate-600/20 to-slate-700/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Activity className={isDemoMode ? 'text-emerald-400' : 'text-slate-400'} size={28} />
            </div>
            <p className="text-base font-semibold text-white mb-1">
              {isDemoMode ? 'Surveillance Active' : 'En Attente'}
            </p>
            <p className="text-sm text-slate-500">
              {isDemoMode
                ? 'Le système surveille vos outils en continu.'
                : 'Connectez un outil pour démarrer la surveillance.'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-500 font-medium">LIVE</span>
          </div>
          <span className="text-slate-600">Mise à jour automatique</span>
        </div>
      </div>
    </div>
  );
};
