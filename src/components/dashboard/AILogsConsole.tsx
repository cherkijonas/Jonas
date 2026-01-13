import { Terminal, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';

export const AILogsConsole = () => {
  const { appState } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="text-cyan-400" size={20} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">AI System Logs</h3>
          <p className="text-xs text-slate-400">Real-time activity monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="text-green-400 animate-pulse" size={16} />
          <span className="text-xs font-medium text-green-400">Live</span>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-700/30 font-mono text-sm max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="space-y-1.5">
          {appState.logs.slice(0, 12).map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-slate-300"
            >
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>{' '}
              <span className="text-cyan-400">{log}</span>
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-green-400"
          >
            <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {'>'} System operational...
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
