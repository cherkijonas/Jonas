import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, AlertTriangle, TrendingUp, Sparkles, ExternalLink, Brain, CheckCircle, Send, MessageSquare, History, Wrench } from 'lucide-react';
import { Issue } from '../../types/issues';
import { AssignmentDropdown } from '../common/AssignmentDropdown';
import { SnoozeDropdown } from '../common/SnoozeDropdown';
import { useApp } from '../../context/AppContext';

interface DeepDiveModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteFix: (issueId: string, pointsReward: number) => void;
  isFixing: boolean;
}

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({
  issue,
  isOpen,
  onClose,
  onExecuteFix,
  isFixing,
}) => {
  const { showToast } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'resolution' | 'discussion' | 'history'>('resolution');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: '@Admin', message: "on valide la suppression ?", time: 'Il y a 5 min' },
  ]);
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);

  if (!issue) return null;

  const handleAssign = (userId: string, userName: string) => {
    showToast(`Ticket assigné à ${userName} avec succès.`, 'success');
  };

  const handleSnooze = (option: string) => {
    showToast(`Alerte reportée à ${option}`, 'info');
    setTimeout(() => {
      handleModalClose();
    }, 500);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now().toString(),
          user: 'Moi',
          message: chatMessage,
          time: 'À l\'instant',
        },
      ]);
      setChatMessage('');
      showToast('Message envoyé', 'success');
    }
  };

  const impactColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    low: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };

  const handleAskGPT = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGenerating(false);
    setSolutionRevealed(true);
  };

  const handleGoToSource = () => {
    if (issue.aiSolution?.actionLink) {
      window.open(issue.aiSolution.actionLink, '_blank');
    }
  };

  const handleVerifyFix = async () => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsVerifying(false);
    onExecuteFix(issue.id, issue.pointsReward);
  };

  const handleModalClose = () => {
    if (!isFixing && !isGenerating && !isVerifying) {
      setSolutionRevealed(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleModalClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{issue.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {issue.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                            impactColors[issue.impact]
                          }`}
                        >
                          Impact {issue.impact}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                          {issue.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleModalClose}
                    disabled={isFixing || isGenerating}
                    className="text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <AssignmentDropdown onAssign={handleAssign} />
                  <SnoozeDropdown onSnooze={handleSnooze} />
                </div>
              </div>

              <div className="border-b border-slate-700 bg-slate-800/30">
                <div className="flex gap-1 px-6">
                  <button
                    onClick={() => setActiveTab('resolution')}
                    className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                      activeTab === 'resolution'
                        ? 'text-white border-blue-500 bg-slate-800/50'
                        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    Résolution
                  </button>
                  <button
                    onClick={() => setActiveTab('discussion')}
                    className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                      activeTab === 'discussion'
                        ? 'text-white border-blue-500 bg-slate-800/50'
                        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Discussion
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                      activeTab === 'history'
                        ? 'text-white border-blue-500 bg-slate-800/50'
                        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Historique
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                {activeTab === 'resolution' && (
                  <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Description du Problème
                  </h3>
                  <p className="text-slate-200 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Temps de Résolution</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {issue.estimatedTimeToFix}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-300 font-semibold">
                        Impact Potentiel
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                      +{issue.pointsReward} Score de Santé
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Systèmes Affectés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.affectedSystems.map((system) => (
                      <span
                        key={system}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                {issue.visualContext && (
                  <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
                        {issue.visualContext.title}
                      </h3>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {issue.visualContext.content}
                      </pre>
                    </div>
                  </div>
                )}

                {!solutionRevealed && !isGenerating && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Besoin d'aide pour résoudre ceci ?
                        </h3>
                        <p className="text-sm text-slate-400">
                          Laissez l'IA analyser le problème et proposer une solution
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAskGPT}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Sparkles className="w-5 h-5" />
                      Demander une solution à GPT-4
                    </button>
                  </div>
                )}

                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Brain className="w-6 h-6 text-purple-400" />
                      </motion.div>
                      <span className="text-purple-300 font-semibold">
                        GPT-4 analyse le problème...
                      </span>
                    </div>
                    <div className="space-y-2">
                      <motion.div
                        className="h-2 bg-slate-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5 }}
                        />
                      </motion.div>
                      <p className="text-xs text-slate-500 text-center">
                        Examen des journaux système et des patterns...
                      </p>
                    </div>
                  </motion.div>
                )}

                {solutionRevealed && issue.aiSolution && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">
                          Analyse IA
                        </h3>
                      </div>
                      <p className="text-slate-200 leading-relaxed mb-6">
                        {issue.aiSolution.analysis}
                      </p>

                      <div className="pt-4 border-t border-purple-500/20">
                        <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-3">
                          Action Recommandée
                        </h4>
                        <p className="text-slate-200 leading-relaxed">
                          {issue.aiSolution.recommendation}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleGoToSource}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {issue.aiSolution.actionLabel}
                    </button>
                  </motion.div>
                )}

                {!isFixing && !isVerifying && solutionRevealed && issue.sourceTool && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-200">
                      <strong>Correction appliquée ?</strong> Après avoir effectué les modifications dans {issue.sourceTool}, cliquez sur "Vérifier la correction" pour confirmer la résolution et augmenter votre score de santé.
                    </p>
                  </div>
                )}

                {!isFixing && !isVerifying && solutionRevealed && !issue.sourceTool && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">
                      <strong>Prêt à appliquer la correction ?</strong> Cliquer sur "Exécuter la correction" implémentera automatiquement la solution recommandée et augmentera votre score de santé.
                    </p>
                  </div>
                )}

                {isVerifying && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                      </motion.div>
                      <span className="text-blue-300 font-semibold">
                        Vérification de la correction dans {issue.sourceTool}...
                      </span>
                    </div>
                    <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                )}

                {isFixing && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap className="w-6 h-6 text-blue-400" />
                      </motion.div>
                      <span className="text-blue-300 font-semibold">
                        Agent IA en cours d'exécution de la correction...
                      </span>
                    </div>
                    <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                )}
                  </>
                )}

                {activeTab === 'discussion' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Discussion d'équipe
                      </h3>
                      <div className="space-y-3 mb-4">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {msg.user[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-sm font-semibold text-slate-300">
                                  {msg.user}
                                </span>
                                <span className="text-xs text-slate-500">{msg.time}</span>
                              </div>
                              <div className="bg-slate-700 px-4 py-2 rounded-lg text-slate-200 text-sm">
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Écrire un commentaire..."
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Envoyer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Historique des modifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 pb-3 border-b border-slate-700">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm font-semibold text-white">
                                Problème créé
                              </span>
                              <span className="text-xs text-slate-500">Il y a 2h</span>
                            </div>
                            <p className="text-sm text-slate-400">
                              Problème détecté automatiquement par le système
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 pb-3 border-b border-slate-700">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm font-semibold text-white">
                                Assigné à Thomas
                              </span>
                              <span className="text-xs text-slate-500">Il y a 1h</span>
                            </div>
                            <p className="text-sm text-slate-400">
                              Problème assigné à Thomas (Dev)
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm font-semibold text-white">
                                En attente
                              </span>
                              <span className="text-xs text-slate-500">Maintenant</span>
                            </div>
                            <p className="text-sm text-slate-400">
                              En attente de résolution
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handleModalClose}
                    disabled={isFixing || isGenerating || isVerifying}
                    className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  {issue.sourceTool && solutionRevealed ? (
                    <button
                      onClick={handleVerifyFix}
                      disabled={isFixing || isGenerating || isVerifying}
                      className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Vérifier la correction
                    </button>
                  ) : (
                    <button
                      onClick={() => onExecuteFix(issue.id, issue.pointsReward)}
                      disabled={isFixing || isGenerating || isVerifying}
                      className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Exécuter la correction
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <button
                    onClick={() => {
                      setAutoFixEnabled(!autoFixEnabled);
                      showToast(
                        !autoFixEnabled
                          ? 'Auto-fix activé pour les problèmes similaires'
                          : 'Auto-fix désactivé',
                        'info'
                      );
                    }}
                    className="relative w-12 h-6 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: autoFixEnabled ? '#3b82f6' : '#475569',
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg"
                      style={{
                        transform: autoFixEnabled ? 'translateX(24px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Toujours effectuer cette action automatiquement à l'avenir
                    </p>
                    <p className="text-xs text-slate-500">
                      L'IA corrigera automatiquement les problèmes similaires
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
