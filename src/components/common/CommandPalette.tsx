import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Link2, Settings, LayoutDashboard, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  type: 'navigation' | 'action' | 'issue';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  issues?: any[];
  onResolveIssue?: (id: string) => void;
  onSnoozeIssue?: (id: string) => void;
}

export const CommandPalette = ({ issues = [], onResolveIssue, onSnoozeIssue }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => {
    const navCommands: CommandItem[] = [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        description: 'View your main dashboard',
        icon: <LayoutDashboard size={18} />,
        type: 'navigation',
        action: () => {
          navigate('/app');
          setIsOpen(false);
        },
        keywords: ['home', 'main', 'overview'],
      },
      {
        id: 'nav-connections',
        title: 'Connections',
        description: 'Manage your integrations',
        icon: <Link2 size={18} />,
        type: 'navigation',
        action: () => {
          navigate('/app/connections');
          setIsOpen(false);
        },
        keywords: ['integrations', 'tools', 'connect'],
      },
      {
        id: 'nav-activity',
        title: 'Activity Logs',
        description: 'View recent activity',
        icon: <FileText size={18} />,
        type: 'navigation',
        action: () => {
          navigate('/app/activity');
          setIsOpen(false);
        },
        keywords: ['logs', 'history', 'events'],
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        description: 'Configure your preferences',
        icon: <Settings size={18} />,
        type: 'navigation',
        action: () => {
          navigate('/app/settings');
          setIsOpen(false);
        },
        keywords: ['preferences', 'config', 'profile'],
      },
    ];

    const issueCommands: CommandItem[] = issues.map((issue) => ({
      id: `issue-${issue.id}`,
      title: issue.title,
      description: `${issue.tool} • ${issue.severity}`,
      icon: <AlertCircle size={18} className="text-orange-400" />,
      type: 'issue',
      action: () => {},
      keywords: [issue.tool, issue.severity, issue.status],
    }));

    return [...navCommands, ...issueCommands];
  }, [issues, navigate]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery));
      return titleMatch || descMatch || keywordMatch;
    });
  }, [query, commands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      }

      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pages, issues, and actions..."
              className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Esc</kbd>
              <span>to close</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-400">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-500'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={index === selectedIndex ? 'text-cyan-400' : 'text-slate-400'}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-slate-300'}`}>
                        {cmd.title}
                      </div>
                      {cmd.description && (
                        <div className="text-xs text-slate-500">{cmd.description}</div>
                      )}
                    </div>
                    {cmd.type === 'issue' && (
                      <div className="flex items-center gap-2">
                        {onResolveIssue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const issueId = cmd.id.replace('issue-', '');
                              onResolveIssue(issueId);
                              setIsOpen(false);
                            }}
                            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                            title="Resolve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Enter</kbd>
                <span>Select</span>
              </div>
            </div>
            <div>
              {filteredCommands.length} {filteredCommands.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
