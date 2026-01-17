import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Filter, X, Clock, User, Target, Activity, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToCSV, exportToJSON, prepareActivityLogsForExport } from '../utils/exportUtils';
import { activityService } from '../services/activityService';
import { useAuth } from '../context/AuthContext';

interface ActivityLog {
  id: string;
  date: string;
  actor: string;
  action: string;
  target: string;
  status: 'success' | 'error' | 'warning';
  transactionId?: string;
  userIp?: string;
  duration?: string;
  metadata?: Record<string, any>;
}

const mockLogs: ActivityLog[] = [
  {
    id: '1',
    date: '17 Déc 2025 - 14:42',
    actor: 'Thomas',
    action: 'Connexion Slack',
    target: 'Workspace Principal',
    status: 'success',
    transactionId: 'TXN-2025-001-4B2A',
    userIp: '192.168.1.42',
    duration: '245ms',
    metadata: { workspace: 'Principal', channels: 42, members: 127 },
  },
  {
    id: '2',
    date: '17 Déc 2025 - 14:30',
    actor: 'IA Flux',
    action: 'Auto-Fix Excel',
    target: 'Budget_Q1_2025.xlsx',
    status: 'success',
    transactionId: 'TXN-2025-002-8F3C',
    userIp: '10.0.0.5 (AI Agent)',
    duration: '1.2s',
    metadata: { filesFixed: 1, rowsProcessed: 542, columnsUpdated: 12 },
  },
  {
    id: '3',
    date: '17 Déc 2025 - 14:15',
    actor: 'Julie',
    action: 'Assignation problème',
    target: 'Slack #General',
    status: 'success',
  },
  {
    id: '4',
    date: '17 Déc 2025 - 14:00',
    actor: 'IA Flux',
    action: 'Détection problème',
    target: 'Outlook Règles Email',
    status: 'warning',
  },
  {
    id: '5',
    date: '17 Déc 2025 - 13:45',
    actor: 'Admin',
    action: 'Configuration webhook',
    target: 'GitHub Repository',
    status: 'success',
  },
  {
    id: '6',
    date: '17 Déc 2025 - 13:30',
    actor: 'Sarah',
    action: 'Correction problème',
    target: 'Google Sheets Sync',
    status: 'error',
  },
  {
    id: '7',
    date: '17 Déc 2025 - 13:15',
    actor: 'Thomas',
    action: 'Commentaire ajouté',
    target: 'Ticket #Excel-001',
    status: 'success',
  },
  {
    id: '8',
    date: '17 Déc 2025 - 13:00',
    actor: 'IA Flux',
    action: 'Analyse complétée',
    target: 'Trello API Rate Limit',
    status: 'success',
  },
];

export const ActivityLogs = () => {
  const { teamId } = useAuth();
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      loadLogs();
    }
  }, [teamId]);

  const loadLogs = async () => {
    if (!teamId) return;
    try {
      const logs = await activityService.getActivities(teamId);
      setDbLogs(logs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Réussi',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'Échec',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          label: 'Attention',
        };
      default:
        return {
          icon: FileText,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: 'Info',
        };
    }
  };

  const transformedLogs: ActivityLog[] = dbLogs.length > 0
    ? dbLogs.map(log => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleString('fr-FR'),
        actor: log.profiles?.full_name || 'Système',
        action: log.action_type,
        target: log.entity_type,
        status: 'success' as const,
        metadata: log.details
      }))
    : mockLogs;

  const filteredLogs = filter === 'all' ? transformedLogs : transformedLogs.filter((log) => log.status === filter);

  const statusCounts = {
    all: transformedLogs.length,
    success: transformedLogs.filter((l) => l.status === 'success').length,
    error: transformedLogs.filter((l) => l.status === 'error').length,
    warning: transformedLogs.filter((l) => l.status === 'warning').length,
  };

  const handleExportCSV = () => {
    const data = prepareActivityLogsForExport(filteredLogs.map(log => ({
      action_type: log.action,
      entity_type: log.target,
      profiles: { full_name: log.actor },
      created_at: log.date,
      details: log.metadata || {}
    })));
    exportToCSV(data, `activity-logs-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredLogs, `activity-logs-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journal d'Activité</h1>
          <p className="text-slate-400">
            Suivez toutes les actions et événements en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Toutes ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Succès ({statusCounts.success})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Erreurs ({statusCounts.error})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'warning'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Attention ({statusCounts.warning})
          </button>
        </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acteur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => {
                const statusConfig = getStatusConfig(log.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">{log.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">{log.actor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{log.target}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              Aucune activité trouvée
            </h3>
            <p className="text-sm text-slate-500">
              Essayez de changer les filtres
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            >
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/90 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white">Détails de l'Activité</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Date & Heure
                    </div>
                    <div className="text-white font-medium">{selectedLog.date}</div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <User className="w-4 h-4" />
                      Acteur
                    </div>
                    <div className="text-white font-medium">{selectedLog.actor}</div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <Activity className="w-4 h-4" />
                      Action
                    </div>
                    <div className="text-white font-medium">{selectedLog.action}</div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <Target className="w-4 h-4" />
                      Cible
                    </div>
                    <div className="text-white font-medium">{selectedLog.target}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedLog.transactionId && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-sm mb-1">Transaction ID</div>
                      <div className="text-white font-mono text-sm">{selectedLog.transactionId}</div>
                    </div>
                  )}

                  {selectedLog.userIp && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-sm mb-1">Adresse IP Utilisateur</div>
                      <div className="text-white font-mono text-sm">{selectedLog.userIp}</div>
                    </div>
                  )}

                  {selectedLog.duration && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-sm mb-1">Durée</div>
                      <div className="text-white font-medium">{selectedLog.duration}</div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-2">Statut</div>
                    {(() => {
                      const statusConfig = getStatusConfig(selectedLog.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </div>
                      );
                    })()}
                  </div>

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 text-sm mb-2">Métadonnées</div>
                      <div className="space-y-2">
                        {Object.entries(selectedLog.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">{key}:</span>
                            <span className="text-white font-medium text-sm">{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
