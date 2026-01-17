import { Plug, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const OnboardingState = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-cyan-500/30"
        >
          <Plug className="w-12 h-12 text-cyan-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Connectez vos outils
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-400 mb-8"
        >
          Aucune donnée disponible pour le moment. Commencez par connecter vos premiers outils pour voir vos métriques et obtenir des insights intelligents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/app/connections')}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Aller aux Connexions
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { name: 'Slack', icon: '💬' },
            { name: 'Jira', icon: '📋' },
            { name: 'GitHub', icon: '🐙' },
            { name: 'Stripe', icon: '💳' },
          ].map((tool, index) => (
            <div
              key={tool.name}
              className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
            >
              <div className="text-2xl mb-2">{tool.icon}</div>
              <div className="text-sm text-slate-400">{tool.name}</div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-slate-500"
        >
          Plus de 33 outils disponibles
        </motion.p>
      </div>
    </motion.div>
  );
};
