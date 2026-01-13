import { Link2, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useGlobal } from '../../context/GlobalContext';

export const IntegrationsHub = () => {
  const navigate = useNavigate();
  const { appState } = useApp();
  const { connectedTools } = useGlobal();

  const connectedIntegrations = connectedTools;

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="text-cyan-400" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-white">Intégrations Actives</h3>
            <p className="text-sm text-slate-400">
              {connectedIntegrations.length} outil{connectedIntegrations.length !== 1 ? 's' : ''} connecté{connectedIntegrations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/app/connections')}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink size={18} />
        </button>
      </div>

      {connectedIntegrations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-slate-400" size={32} />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Aucune Connexion Active</h4>
          <p className="text-sm text-slate-400 mb-4">
            Connectez des outils pour commencer la surveillance
          </p>
          <button
            onClick={() => navigate('/app/connections')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            Parcourir les Intégrations
          </button>
        </div>
      ) : (
        <div className="flex-1 space-y-3 mb-6">
          {connectedIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className="bg-slate-800/30 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${integration.gradient} shadow-lg flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white truncate">{integration.name}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-400">Actif</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{integration.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Journal d'Activité</span>
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {appState.logs.map((log, index) => (
            <p key={index} className="text-slate-400">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
