import { Plug, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const EmptySetupCard = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 shadow-xl"
    >
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <Plug className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">
          Connectez vos outils pour démarrer
        </h2>

        <p className="text-lg text-slate-400 mb-8 max-w-lg">
          InsightFlow a besoin d'accès API pour générer des insights.
          Commencez par connecter Slack, Jira ou Excel pour débloquer
          l'analyse de vos données.
        </p>

        <button
          onClick={() => navigate('/app/connections')}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
        >
          <span>Aller aux Connexions</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 pt-8 border-t border-slate-700 w-full">
          <p className="text-sm text-slate-500 mb-4">Outils populaires :</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Jira', 'Slack', 'GitHub', 'Notion', 'Excel', 'Teams'].map((tool) => (
              <div
                key={tool}
                className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-slate-300 text-sm"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
