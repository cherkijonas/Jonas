import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Sparkles, Clock } from 'lucide-react';
import { aiAnalysisService } from '../../services/aiAnalysisService';

interface SolvedProblem {
  id: string;
  tool_name: string;
  problem_type: string;
  severity: string;
  title: string;
  solved_at: string;
}

interface SolvedProblemsWidgetProps {
  userId: string;
}

export const SolvedProblemsWidget = ({ userId }: SolvedProblemsWidgetProps) => {
  const [solvedProblems, setSolvedProblems] = useState<SolvedProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolvedProblems();
  }, [userId]);

  const loadSolvedProblems = async () => {
    try {
      const data = await aiAnalysisService.getSolvedProblems(userId);
      setSolvedProblems(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load solved problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'friction':
        return '🔧';
      case 'performance':
        return '⚡';
      case 'cost':
        return '💰';
      case 'security':
        return '🔒';
      case 'workflow':
        return '🔄';
      default:
        return '✨';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Trophy className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Problèmes Résolus</h3>
          <p className="text-sm text-slate-400">{solvedProblems.length} résolutions récentes</p>
        </div>
      </div>

      {solvedProblems.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Aucun problème résolu pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {solvedProblems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 bg-slate-900/30 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 transition-all"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white line-clamp-1">{problem.title}</h4>
                  <span className="text-lg flex-shrink-0">{getTypeEmoji(problem.problem_type)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-700/50 rounded">{problem.tool_name}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(problem.solved_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {solvedProblems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-emerald-500/20">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">
              Excellent travail! Continuez comme ça!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
