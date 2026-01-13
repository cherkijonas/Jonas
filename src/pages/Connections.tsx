import { useState, useMemo } from 'react';
import { Search, Link2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';

const categoryLabels: Record<string, string> = {
  'productivity': '🟠 Productivité',
  'communication': '🟢 Communication',
  'crm': '🔵 CRM & Ventes',
  'design': '🟣 Design',
  'support': '🔴 Support',
  'storage': '🟤 Stockage',
  'cloud': '⚫ Cloud',
  'monitoring': '🟡 Monitoring',
};

export const Connections = () => {
  const { integrations, toggleIntegration } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    await toggleIntegration(id);
    setTogglingId(null);
  };

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || integration.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, integrations]);

  const connectedCount = integrations.filter((i) => i.connected).length;
  const categories = [...new Set(integrations.map((i) => i.category))];

  const groupedIntegrations = useMemo(() => {
    const grouped: Record<string, typeof integrations> = {};
    categories.forEach((category) => {
      grouped[category] = filteredIntegrations.filter((i) => i.category === category);
    });
    return grouped;
  }, [categories, filteredIntegrations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Magasin d'Intégrations</h1>
          <p className="text-slate-400">
            {connectedCount} sur {integrations.length} outils connectés
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-lg">
          <Link2 className="text-emerald-400" size={20} />
          <span className="text-sm font-medium text-emerald-400">
            {connectedCount} Connexions Actives
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher parmi 33 outils (Slack, Stripe, Figma, Salesforce...)..."
            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-lg"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            Toutes les catégories
            <span className="ml-2 text-xs opacity-70">({integrations.length})</span>
          </button>
          {categories.map((category) => {
            const count = integrations.filter((i) => i.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {categoryLabels[category] || category}
                <span className="ml-2 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredIntegrations.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {selectedCategory === 'all'
              ? categories.map((category) => {
                  const categoryIntegrations = groupedIntegrations[category];
                  if (categoryIntegrations.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-white">
                          {categoryLabels[category] || category}
                        </h2>
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-400">
                          {categoryIntegrations.length} outil{categoryIntegrations.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryIntegrations.map((integration, index) => {
                          const Icon = integration.icon;
                          return (
                            <motion.div
                              key={integration.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div
                                  className={`w-12 h-12 bg-gradient-to-br ${integration.gradient} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                                >
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                {integration.connected ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-400">
                                      Connecté
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700 rounded-lg">
                                    <Circle className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500">
                                      Disponible
                                    </span>
                                  </div>
                                )}
                              </div>

                              <h3 className="text-lg font-bold text-white mb-1.5">
                                {integration.name}
                              </h3>
                              <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                {integration.description}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {integration.capabilities.slice(0, 3).map((capability) => (
                                  <span
                                    key={capability}
                                    className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-400"
                                  >
                                    {capability}
                                  </span>
                                ))}
                                {integration.capabilities.length > 3 && (
                                  <span className="px-2 py-0.5 text-xs text-slate-500">
                                    +{integration.capabilities.length - 3}
                                  </span>
                                )}
                              </div>

                              {integration.lastSync && (
                                <p className="text-xs text-slate-500">
                                  Dernière synchro: {new Date(integration.lastSync).toLocaleString('fr-FR')}
                                </p>
                              )}

                              <button
                                onClick={() => handleToggle(integration.id)}
                                disabled={togglingId === integration.id}
                                className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer ${
                                  integration.connected
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {togglingId === integration.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {integration.connected ? 'Déconnexion...' : 'Connexion...'}
                                  </>
                                ) : (
                                  integration.connected ? 'Déconnecter' : 'Connecter'
                                )}
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              : groupedIntegrations[selectedCategory] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedIntegrations[selectedCategory].map((integration, index) => {
                      const Icon = integration.icon;
                      return (
                        <motion.div
                          key={integration.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${integration.gradient} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            {integration.connected ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-400">
                                  Connecté
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700 rounded-lg">
                                <Circle className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs font-semibold text-slate-500">
                                  Disponible
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-white mb-1.5">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {integration.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {integration.capabilities.slice(0, 3).map((capability) => (
                              <span
                                key={capability}
                                className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-400"
                              >
                                {capability}
                              </span>
                            ))}
                            {integration.capabilities.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-slate-500">
                                +{integration.capabilities.length - 3}
                              </span>
                            )}
                          </div>

                          {integration.lastSync && (
                            <p className="text-xs text-slate-500">
                              Dernière synchro: {integration.lastSync}
                            </p>
                          )}

                          <button
                            className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              integration.connected
                                ? 'bg-gradient-to-br from-emerald-500/5 to-green-500/5'
                                : 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5'
                            }`}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun outil trouvé</h3>
            <p className="text-slate-400">Essayez d'ajuster votre recherche ou vos filtres</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
