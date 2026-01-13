import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Issue } from '../../types/issues';
import { IssueActions } from '../common/IssueActions';

interface IssuesPanelProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onResolveIssue?: (id: string) => void;
  onSnoozeIssue?: (id: string, until: Date) => void;
  onAssignIssue?: (id: string, userId: string) => void;
}

export const IssuesPanel: React.FC<IssuesPanelProps> = ({
  issues,
  onIssueClick,
  onResolveIssue,
  onSnoozeIssue,
  onAssignIssue
}) => {
  const unresolvedIssues = issues.filter((issue) => !issue.resolved);
  const resolvedCount = issues.filter((issue) => issue.resolved).length;

  const impactColors = {
    high: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10',
    medium: 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10',
    low: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10',
  };

  const impactDotColors = {
    high: 'bg-red-500',
    medium: 'bg-orange-500',
    low: 'bg-yellow-500',
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Critical Issues</h2>
          <p className="text-sm text-slate-400">
            {unresolvedIssues.length} active issue
            {unresolvedIssues.length !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        {resolvedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">
              {resolvedCount} Resolved
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-3">
        {unresolvedIssues.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
            <p className="text-slate-400">No critical issues detected</p>
          </div>
        ) : (
          unresolvedIssues.map((issue, index) => (
            <motion.button
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onIssueClick(issue)}
              className={`w-full p-4 rounded-xl border transition-all group ${
                impactColors[issue.impact]
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{issue.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        impactDotColors[issue.impact]
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
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {issue.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{issue.affectedSystems.length} systems affected</span>
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
