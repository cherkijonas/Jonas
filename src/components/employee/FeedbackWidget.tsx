import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { employeeFeedbackService } from '../../services/employeeFeedbackService';

interface FeedbackWidgetProps {
  userId: string;
}

export const FeedbackWidget = ({ userId }: FeedbackWidgetProps) => {
  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'friction'>('friction');
  const [message, setMessage] = useState('');
  const [toolName, setToolName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await employeeFeedbackService.submitFeedback({
        user_id: userId,
        feedback_type: feedbackType,
        message: message.trim(),
        tool_name: toolName.trim() || null,
        sentiment: feedbackType === 'positive' ? 'positive' : feedbackType === 'negative' ? 'negative' : 'neutral',
      });

      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setMessage('');
        setToolName('');
        setSubmitted(false);
        setFeedbackType('friction');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    {
      type: 'friction' as const,
      label: 'Friction',
      icon: AlertTriangle,
      color: 'amber',
      description: 'Signalez un problème ou une difficulté',
    },
    {
      type: 'negative' as const,
      label: 'Problème',
      icon: ThumbsDown,
      color: 'red',
      description: 'Partagez un retour négatif',
    },
    {
      type: 'positive' as const,
      label: 'Positif',
      icon: ThumbsUp,
      color: 'emerald',
      description: 'Partagez ce qui fonctionne bien',
    },
  ];

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl hover:border-cyan-500/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-all">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white text-sm">Donner du Feedback</h3>
            <p className="text-xs text-slate-400">
              Partagez vos frictions ou suggestions
            </p>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full p-6"
            >
              {!submitted ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Votre Feedback</h2>
                        <p className="text-sm text-slate-400">Aidez-nous à améliorer votre expérience</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Type de feedback
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {feedbackTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = feedbackType === type.type;
                          return (
                            <button
                              key={type.type}
                              onClick={() => setFeedbackType(type.type)}
                              className={`p-3 rounded-lg border transition-all ${
                                isSelected
                                  ? `bg-${type.color}-500/20 border-${type.color}-500/50`
                                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 mx-auto mb-1 ${
                                  isSelected ? `text-${type.color}-400` : 'text-slate-400'
                                }`}
                              />
                              <p
                                className={`text-xs font-medium ${
                                  isSelected ? `text-${type.color}-400` : 'text-slate-400'
                                }`}
                              >
                                {type.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Outil concerné (optionnel)
                      </label>
                      <input
                        type="text"
                        value={toolName}
                        onChange={(e) => setToolName(e.target.value)}
                        placeholder="Ex: Slack, GitHub, Jira..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Votre message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Décrivez votre expérience..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!message.trim() || submitting}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Envoyer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Feedback envoyé!</h3>
                  <p className="text-slate-400">
                    Merci pour votre retour. Il sera analysé pour améliorer votre expérience.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
