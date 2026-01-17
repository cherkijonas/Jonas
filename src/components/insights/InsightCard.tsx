import { AlertTriangle, Info, Brain, Zap, Clock } from 'lucide-react';
import { Alert } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

interface InsightCardProps {
  alert: Alert;
}

export const InsightCard = ({ alert }: InsightCardProps) => {
  const { applyFix, isApplyingFix, fixingAlertId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const isFixing = isApplyingFix && fixingAlertId === alert.id;

  const getAlertStyle = () => {
    switch (alert.type) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          bg: 'from-red-500/5 to-red-600/5',
          icon: <AlertTriangle className="text-red-400" size={20} />,
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'from-yellow-500/5 to-yellow-600/5',
          icon: <AlertTriangle className="text-yellow-400" size={20} />,
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'from-blue-500/5 to-blue-600/5',
          icon: <Info className="text-blue-400" size={20} />,
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
    }
  };

  const style = getAlertStyle();

  const handleApplyFix = async () => {
    setShowModal(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await applyFix(alert.id);
    setShowModal(false);
  };

  return (
    <>
      <div
        className={`bg-gradient-to-br ${style.bg} backdrop-blur-xl rounded-xl p-6 border ${style.border} hover:border-opacity-50 transition-all duration-300 shadow-lg`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800/50 rounded-lg">{style.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-medium rounded border ${style.badge}`}>
                  {alert.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-400">{alert.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} />
            {alert.timestamp}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <p className="text-sm text-slate-300">{alert.context}</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-start gap-2 mb-2">
              <Brain className="text-cyan-400 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                AI Analysis
              </span>
            </div>
            <p className="text-sm text-slate-300">{alert.aiAnalysis}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
          <div>
            <p className="text-xs text-slate-500 mb-1">Impact</p>
            <p className="text-sm font-semibold text-white">{alert.impact}</p>
          </div>
          {alert.type !== 'info' && (
            <button
              onClick={handleApplyFix}
              disabled={isFixing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={16} />
              {isFixing ? 'Applying Fix...' : 'Apply AI Fix'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl max-w-lg w-full mx-4 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Fix in Progress</h3>
                <p className="text-sm text-slate-400">Analyzing and applying solution...</p>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50 mb-6">
              <div className="space-y-2 text-sm font-mono">
                <p className="text-cyan-400">
                  <span className="text-slate-500">&gt;</span> Analyzing issue pattern...
                </p>
                <p className="text-blue-400">
                  <span className="text-slate-500">&gt;</span> Generating solution...
                </p>
                <p className="text-green-400">
                  <span className="text-slate-500">&gt;</span> {alert.solution}
                </p>
                <p className="text-yellow-400 animate-pulse">
                  <span className="text-slate-500">&gt;</span> Applying changes...
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
