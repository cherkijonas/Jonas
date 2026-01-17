import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Issue } from '../../types/issues';
import { IssueActions } from '../common/IssueActions';

interface OtherIssuesPanelProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onResolveIssue?: (id: string) => void;
  onSnoozeIssue?: (id: string, until: Date) => void;
  onAssignIssue?: (id: string, userId: string) => void;
}

export const OtherIssuesPanel: React.FC<OtherIssuesPanelProps> = ({
  issues,
  onIssueClick,
  onResolveIssue,
  onSnoozeIssue,
  onAssignIssue
}) => {
  const [filter, setFilter] = useState<'all' | 'medium' | 'low'>('all');

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.impact === filter;
  });

  const mediumCount = issues.filter(i => i.impact === 'medium').length;
  const lowCount = issues.filter(i => i.impact === 'low').length;

  const impactColors = {
    medium: 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10',
    low: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10',
  };

  const impactDotColors = {
    medium: 'bg-orange-500',
    low: 'bg-yellow-500',
  };

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Autres Alertes</h2>
            <p className="text-sm text-slate-400">
              {issues.length} alerte{issues.length !== 1 ? 's' : ''} de priorité moyenne/basse
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toutes ({issues.length})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'medium'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Moyenne ({mediumCount})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'low'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Basse ({lowCount})
          </button>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aucune alerte dans cette catégorie</p>
          </div>
        ) : (
          filteredIssues.map((issue, index) => (
            <motion.button
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onIssueClick(issue)}
              className={`w-full p-4 rounded-xl border transition-all group ${
                impactColors[issue.impact as 'medium' | 'low']
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">{issue.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        impactDotColors[issue.impact as 'medium' | 'low']
                      }`}
                    />
                    <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      {issue.category}
                    </span>
                    {issue.sourceTool && issue.toolIcon && (
                      <span className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${issue.toolColor} text-white shadow-sm`}>
                        {(() => {
                          const IconComponent = (LucideIcons as any)[issue.toolIcon];
                          return IconComponent ? <IconComponent className="w-3.5 h-3.5" /> : null;
                        })()}
                        {issue.sourceTool}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {issue.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{issue.affectedSystems.length} systèmes</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        +{issue.pointsReward} points
                      </span>
                    </div>
                    {(onResolveIssue || onSnoozeIssue || onAssignIssue) && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <IssueActions
                          issueId={issue.id}
                          onResolve={onResolveIssue || (() => {})}
                          onSnooze={onSnoozeIssue || (() => {})}
                          onAssign={onAssignIssue || (() => {})}
                          compact
                        />
                      </div>
                    )}
                  </div>
                </div>
                <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};
