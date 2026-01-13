import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, MessageSquare, AlertTriangle, TrendingUp, Database, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReactiveWidgets = () => {
  const { integrations } = useApp();

  const hasExcelOrSheets = integrations.some(
    (i) => (i.id === 'excel' || i.id === 'sheets') && i.connected
  );

  const hasSlackOrTeams = integrations.some(
    (i) => (i.id === 'slack' || i.id === 'teams') && i.connected
  );

  const hasJiraOrTrello = integrations.some(
    (i) => (i.id === 'jira' || i.id === 'trello') && i.connected
  );

  const widgets = [];

  if (hasExcelOrSheets) {
    widgets.push({
      id: 'financial',
      icon: Sheet,
      title: 'Données Financières Analysées',
      description: 'Intégration Excel/Sheets active',
      metrics: [
        { label: 'Tendances Revenus', value: '+12,5%', color: 'text-green-400' },
        { label: 'Dépenses', value: '42,3K€', color: 'text-blue-400' },
        { label: 'Marge Bénéficiaire', value: '23,8%', color: 'text-cyan-400' },
      ],
      bgColor: 'from-green-500/10 to-emerald-600/10',
      borderColor: 'border-green-500/20',
    });
  }

  if (hasSlackOrTeams) {
    widgets.push({
      id: 'communication',
      icon: MessageSquare,
      title: 'Surcharge Communication',
      description: 'Intégration Slack/Teams active',
      metrics: [
        { label: 'Messages non lus', value: '234', color: 'text-yellow-400' },
        { label: 'Canaux actifs', value: '47', color: 'text-blue-400' },
        { label: 'Temps de réponse', value: '12m', color: 'text-purple-400' },
      ],
      bgColor: 'from-purple-500/10 to-pink-600/10',
      borderColor: 'border-purple-500/20',
    });
  }

  if (hasJiraOrTrello) {
    widgets.push({
      id: 'bottleneck',
      icon: AlertTriangle,
      title: 'Détection des Goulots',
      description: 'Intégration Jira/Trello active',
      metrics: [
        { label: 'Tâches Bloquées', value: '8', color: 'text-red-400' },
        { label: 'En Cours', value: '23', color: 'text-yellow-400' },
        { label: 'Terminées', value: '156', color: 'text-green-400' },
      ],
      bgColor: 'from-orange-500/10 to-red-600/10',
      borderColor: 'border-orange-500/20',
    });
  }

  return (
    <div className="mb-6">
      <AnimatePresence mode="popLayout">
        {widgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={20} />
              Analyses IA des Outils Connectés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-gradient-to-br ${widget.bgColor} backdrop-blur-xl rounded-xl p-6 border ${widget.borderColor}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <widget.icon className="text-cyan-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{widget.title}</h4>
                      <p className="text-xs text-slate-400">{widget.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {widget.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{metric.label}</span>
                        <span className={`text-sm font-semibold ${metric.color}`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
