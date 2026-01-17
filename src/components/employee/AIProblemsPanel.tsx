import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  DollarSign,
  Shield,
  Workflow,
  Sparkles,
  ThumbsUp,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { aiAnalysisService } from '../../services/aiAnalysisService';

interface Problem {
  id: string;
  tool_name: string;
  problem_type: string;
  severity: string;
  title: string;
  description: string;
  ai_recommendation: string;
  detected_at: string;
  status: string;
}

interface AIProblemsPanelProps {
  userId: string;
}

export const AIProblemsPanel = ({ userId }: AIProblemsPanelProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadProblems();
    loadStats();
  }, [userId]);

  const loadProblems = async () => {
    try {
      const data = await aiAnalysisService.getActiveProblems(userId);
      setProblems(data);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await aiAnalysisService.getAnalysisStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleMarkSolved = async (problemId: string) => {
    try {
      await aiAnalysisService.updateProblemStatus(problemId, 'solved');
      await loadProblems();
      await loadStats();
    } catch (error) {
      console.error('Failed to mark problem as solved:', error);
    }
  };

  const handleUpdateStatus = async (problemId: string, status: 'acknowledged' | 'in_progress') => {
    try {
      await aiAnalysisService.updateProblemStatus(problemId, status);
      await loadProblems();
    } catch (error) {
      console.error('Failed to update problem status:', error);
    }
  };

  const getProblemIcon = (type: string) => {
    switch (type) {
      case 'friction':
        return { Icon: AlertTriangle, color: 'amber' };
      case 'performance':
        return { Icon: Zap, color: 'cyan' };
      case 'cost':
        return { Icon: DollarSign, color: 'emerald' };
      case 'security':
        return { Icon: Shield, color: 'red' };
      case 'workflow':
        return { Icon: Workflow, color: 'violet' };
      default:
        return { Icon: AlertTriangle, color: 'slate' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/50';
      case 'high':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      case 'medium':
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/50';
      case 'low':
        return 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      friction: 'Friction',
      performance: 'Performance',
      cost: 'Coût',
      security: 'Sécurité',
      workflow: 'Workflow',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700/50 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl">
            <div className="text-2xl font-bold text-white">{stats.active}</div>
            <div className="text-sm text-slate-400">Problèmes Actifs</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl">
            <div className="text-2xl font-bold text-white">{stats.bySeverity.critical}</div>
            <div className="text-sm text-slate-400">Critiques</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-xl">
            <div className="text-2xl font-bold text-white">{stats.solved}</div>
            <div className="text-sm text-slate-400">Résolus</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/30 rounded-xl">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
        </div>
      )}

      {problems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Excellent Travail!</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Aucun problème actif détecté. Vos outils fonctionnent de manière optimale.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {problems.map((problem, index) => {
            const { Icon, color } = getProblemIcon(problem.problem_type);
            const isExpanded = expandedProblem === problem.id;

            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-to-br ${getSeverityColor(
                  problem.severity
                )} border rounded-xl overflow-hidden hover:shadow-lg transition-all`}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedProblem(isExpanded ? null : problem.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-${color}-500/20 rounded-lg flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${color}-400`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityBadge(
                                problem.severity
                              )}`}
                            >
                              {problem.severity.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                              {getTypeLabel(problem.problem_type)}
                            </span>
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                              {problem.tool_name}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">{problem.title}</h3>
                          <p className="text-sm text-slate-300">{problem.description}</p>
                        </div>

                        <button className="p-2 hover:bg-slate-700/30 rounded transition-all">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          Détecté le {new Date(problem.detected_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-700/50"
                    >
                      <div className="p-5 bg-slate-900/50">
                        <div className="flex items-start gap-3 mb-4">
                          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">
                              Recommandation IA
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {problem.ai_recommendation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                          {problem.status === 'detected' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(problem.id, 'acknowledged');
                              }}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all"
                            >
                              Prendre Connaissance
                            </button>
                          )}
                          {problem.status === 'acknowledged' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(problem.id, 'in_progress');
                              }}
                              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg border border-cyan-500/30 transition-all"
                            >
                              En Cours de Résolution
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkSolved(problem.id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Marquer Résolu
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
