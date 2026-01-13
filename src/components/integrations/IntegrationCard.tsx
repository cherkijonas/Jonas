import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Integration } from '../../data/integrations';
import { useApp } from '../../context/AppContext';

interface IntegrationCardProps {
  integration: Integration;
}

export const IntegrationCard = ({ integration }: IntegrationCardProps) => {
  const { connectIntegration, disconnectIntegration, connectingId } = useApp();
  const isConnecting = connectingId === integration.id;

  const IconComponent = (LucideIcons as any)[integration.icon] || LucideIcons.Box;

  const handleClick = async () => {
    if (integration.connected) {
      disconnectIntegration(integration.id);
    } else {
      await connectIntegration(integration.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
        integration.connected
          ? 'border-green-500/50 shadow-lg shadow-green-500/20'
          : 'border-slate-700/50 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${integration.color} shadow-lg`}>
          <IconComponent className="text-white" size={24} />
        </div>
        {integration.connected && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">Actif</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{integration.name}</h3>
        <p className="text-sm text-slate-400">{integration.description}</p>
      </div>

      <button
        onClick={handleClick}
        disabled={isConnecting}
        className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          integration.connected
            ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Connexion...
          </>
        ) : integration.connected ? (
          <>
            <Check size={16} />
            Connecté
          </>
        ) : (
          'Connecter'
        )}
      </button>
    </motion.div>
  );
};
