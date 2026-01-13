import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGlobal } from '../context/GlobalContext';
import { HealthGauge } from './dashboard/HealthGauge';
import { KPICard } from './dashboard/KPICard';
import { VelocityChart } from './dashboard/VelocityChart';
import { MoneyWastedCounter } from './dashboard/MoneyWastedCounter';
import { ReactiveWidgets } from './dashboard/ReactiveWidgets';
import { AILogsConsole } from './dashboard/AILogsConsole';
import { InsightFeed } from './insights/InsightFeed';
import { IntegrationsHub } from './integrations/IntegrationsHub';
import { EmptyState } from './EmptyState';
import { IssuesPanel } from './dashboard/IssuesPanel';
import { OtherIssuesPanel } from './dashboard/OtherIssuesPanel';
import { DeepDiveModal } from './dashboard/DeepDiveModal';
import { OKRWidget } from './dashboard/OKRWidget';
import { TeamPulseWidget } from './dashboard/TeamPulseWidget';
import { EmptySetupCard } from './dashboard/EmptySetupCard';
import { OnboardingState } from './dashboard/OnboardingState';
import { TeamJoinRequestForm } from './dashboard/TeamJoinRequestForm';
import { Clock, Users, AlertTriangle, Smile, X, TrendingUp, Shield, DollarSign, Server } from 'lucide-react';
import { Issue } from '../types/issues';
import { motion, AnimatePresence } from 'framer-motion';

type ModalType = 'health' | 'money' | null;

export const Dashboard = () => {
  const { appState } = useApp();
  const { userProfile, healthScore, connectedTools, visibleIssues, resolveIssue } = useGlobal();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isExecutingFix, setIsExecutingFix] = useState(false);

  const isManager = userProfile.role === 'Manager';
  const isEmptyState = connectedTools.length === 0;

  const criticalIssues = visibleIssues.filter((issue) => issue.impact === 'high' && !issue.resolved);
  const otherIssues = visibleIssues.filter((issue) => (issue.impact === 'medium' || issue.impact === 'low') && !issue.resolved);

  const handleSnoozeIssue = async (id: string, until: Date) => {
    console.log('Snoozing issue', id, 'until', until);
  };

  const handleAssignIssue = async (id: string, userId: string) => {
    console.log('Assigning issue', id, 'to user', userId);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isExecutingFix) {
      setIsModalOpen(false);
      setTimeout(() => setSelectedIssue(null), 300);
    }
  };

  const handleExecuteFix = async (issueId: string, pointsReward: number) => {
    setIsExecutingFix(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    resolveIssue(issueId, pointsReward);
    setIsExecutingFix(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setTimeout(() => setSelectedIssue(null), 300);
    }, 500);
  };

  return (
    <>
      <div className="space-y-6">
        {isEmptyState ? (
          <OnboardingState />
        ) : (
          <>
            <ReactiveWidgets />

            {!isManager && (
              <TeamJoinRequestForm />
            )}

            <IssuesPanel
              issues={criticalIssues}
              onIssueClick={handleIssueClick}
              onResolveIssue={resolveIssue}
              onSnoozeIssue={handleSnoozeIssue}
              onAssignIssue={handleAssignIssue}
            />

            <OtherIssuesPanel
              issues={otherIssues}
              onIssueClick={handleIssueClick}
              onResolveIssue={resolveIssue}
              onSnoozeIssue={handleSnoozeIssue}
              onAssignIssue={handleAssignIssue}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <HealthGauge
                  score={isDemoMode ? appState.metrics.healthScore : healthScore}
                  onClick={() => setActiveModal('health')}
                />
              </div>
              {isManager && (
                <div className="lg:col-span-2">
                  <MoneyWastedCounter
                    amount={appState.metrics.moneyWasted}
                    onClick={() => setActiveModal('money')}
                  />
                </div>
              )}
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Stalled Tickets"
          value={appState.metrics.ticketsStalled}
          subtitle="Requiring attention"
          icon={AlertTriangle}
          trend={appState.metrics.ticketsStalled > 5 ? 'down' : 'up'}
          trendValue={`${appState.metrics.ticketsStalled} total`}
          iconColor={appState.metrics.ticketsStalled > 5 ? 'text-red-400' : 'text-green-400'}
          animate
        />
        <KPICard
          title="Avg Response Time"
          value={`${appState.metrics.avgResponseTime}d`}
          subtitle="Client inquiries"
          icon={Clock}
          trend={appState.metrics.avgResponseTime < 2 ? 'up' : 'down'}
          trendValue={`${appState.metrics.avgResponseTime} days`}
          iconColor={appState.metrics.avgResponseTime < 2 ? 'text-green-400' : 'text-yellow-400'}
        />
        <KPICard
          title="Team Capacity"
          value="73%"
          subtitle="Utilization rate"
          icon={Users}
          trend="neutral"
          trendValue="Optimal range"
          iconColor="text-cyan-400"
        />
        <KPICard
          title="Client Satisfaction"
          value={`${appState.metrics.clientSatisfaction}%`}
          subtitle="Overall rating"
          icon={Smile}
          trend={appState.metrics.clientSatisfaction > 80 ? 'up' : 'down'}
          trendValue={`${appState.metrics.clientSatisfaction}% score`}
          iconColor={appState.metrics.clientSatisfaction > 80 ? 'text-green-400' : 'text-yellow-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OKRWidget />
        {isManager && <TeamPulseWidget />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VelocityChart data={appState.metrics.velocityData} />
        </div>
        <div className="lg:col-span-1">
          <IntegrationsHub />
        </div>
      </div>

      <div>
        <InsightFeed />
      </div>

      <AILogsConsole />
          </>
        )}
    </div>

      <DeepDiveModal
        issue={selectedIssue}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onExecuteFix={handleExecuteFix}
        isFixing={isExecutingFix}
      />

      <AnimatePresence>
        {activeModal === 'health' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Score de Santé - Détails</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Excellence Opérationnelle</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">80%</div>
                    <p className="text-sm text-green-400/70 mt-1">Processus bien optimisés</p>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Sécurité</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400">40%</div>
                    <p className="text-sm text-red-400/70 mt-1">Nécessite attention</p>
                  </div>

                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Collaboration</span>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400">75%</div>
                    <p className="text-sm text-cyan-400/70 mt-1">Communication fluide</p>
                  </div>

                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Vélocité</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">65%</div>
                    <p className="text-sm text-yellow-400/70 mt-1">Peut être amélioré</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <h3 className="font-semibold text-white mb-2">Recommandations</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Renforcer les protocoles de sécurité</li>
                    <li>• Améliorer la documentation des processus</li>
                    <li>• Réduire les délais de réponse des tickets</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === 'money' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Argent Gaspillé - Détails</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="font-semibold text-white">Serveurs Inactifs</div>
                          <p className="text-sm text-red-400/70">12 instances EC2 non utilisées</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-400">2 000€</div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="font-semibold text-white">Licences Non Utilisées</div>
                          <p className="text-sm text-orange-400/70">47 licences Slack inactives</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-400">1 000€</div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-semibold text-white">Processus Inefficaces</div>
                          <p className="text-sm text-yellow-400/70">Temps perdu en réunions improductives</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">500€</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Total Mensuel</h3>
                    <div className="text-3xl font-bold text-red-400">3 500€</div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Économies potentielles annuelles: <span className="text-white font-semibold">42 000€</span>
                  </p>
                </div>

                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <h3 className="font-semibold text-cyan-400 mb-2">Actions Recommandées</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Arrêter les serveurs EC2 inactifs depuis plus de 7 jours</li>
                    <li>• Révoquer les licences Slack non utilisées depuis 30 jours</li>
                    <li>• Mettre en place des audits de réunions hebdomadaires</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
