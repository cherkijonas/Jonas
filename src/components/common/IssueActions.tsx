import { useState } from 'react';
import { CheckCircle2, Clock, UserPlus, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IssueActionsProps {
  issueId: string;
  onResolve: (id: string) => void;
  onSnooze: (id: string, until: Date) => void;
  onAssign: (id: string, userId: string) => void;
  compact?: boolean;
}

export const IssueActions = ({ issueId, onResolve, onSnooze, onAssign, compact = false }: IssueActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const snoozeOptions = [
    { label: '1 hour', hours: 1 },
    { label: '4 hours', hours: 4 },
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '1 week', hours: 168 },
  ];

  const handleSnooze = (hours: number) => {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    onSnooze(issueId, until);
    setShowSnoozeOptions(false);
    setShowMenu(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <MoreVertical size={16} className="text-slate-400" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setShowMenu(false);
                  setShowSnoozeOptions(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onResolve(issueId);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 text-left text-sm text-slate-200 transition-colors"
                >
                  <CheckCircle2 size={16} className="text-green-400" />
                  Resolve Issue
                </button>

                <button
                  onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 text-left text-sm text-slate-200 transition-colors"
                >
                  <Clock size={16} className="text-blue-400" />
                  Snooze
                </button>

                {showSnoozeOptions && (
                  <div className="bg-slate-900/50 border-t border-slate-700">
                    {snoozeOptions.map((option) => (
                      <button
                        key={option.hours}
                        onClick={() => handleSnooze(option.hours)}
                        className="w-full px-8 py-2 hover:bg-slate-700 text-left text-xs text-slate-300 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 text-left text-sm text-slate-200 transition-colors"
                >
                  <UserPlus size={16} className="text-cyan-400" />
                  Assign
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onResolve(issueId)}
        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium"
      >
        <CheckCircle2 size={16} />
        Resolve
      </button>

      <div className="relative">
        <button
          onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium"
        >
          <Clock size={16} />
          Snooze
        </button>

        <AnimatePresence>
          {showSnoozeOptions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSnoozeOptions(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden"
              >
                {snoozeOptions.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => handleSnooze(option.hours)}
                    className="w-full px-4 py-2 hover:bg-slate-700 text-left text-sm text-slate-200 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <button
        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors text-sm font-medium"
      >
        <UserPlus size={16} />
        Assign
      </button>
    </div>
  );
};
