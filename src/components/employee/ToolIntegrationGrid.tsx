import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Users,
  MessageCircle,
  Phone,
  Video,
  Camera,
  Mail,
  Zap,
  Trello,
  CheckSquare,
  Book,
  LayoutGrid,
  LineChart,
  Calendar,
  MousePointer,
  Mountain,
  Sheet,
  Table,
  HardDrive,
  Cloud,
  Package,
  Target,
  TrendingUp,
  Headphones,
  Github,
  GitBranch,
  Triangle,
  CreditCard,
} from 'lucide-react';
import { integrationsList } from '../../data/integrations';
import { employeeProfileService } from '../../services/employeeProfileService';
import { aiAnalysisService } from '../../services/aiAnalysisService';
import { useAuth } from '../../context/AuthContext';

const iconMap: Record<string, any> = {
  MessageSquare,
  Users,
  MessageCircle,
  Phone,
  Video,
  Camera,
  Mail,
  Zap,
  Trello,
  CheckSquare,
  Book,
  LayoutGrid,
  LineChart,
  Calendar,
  MousePointer,
  Mountain,
  Sheet,
  Table,
  HardDrive,
  Cloud,
  Package,
  Target,
  TrendingUp,
  Headphones,
  Github,
  GitBranch,
  Triangle,
  CreditCard,
};

interface ToolIntegrationGridProps {
  onToolsChange?: (connectedTools: string[]) => void;
}

export const ToolIntegrationGrid = ({ onToolsChange }: ToolIntegrationGridProps) => {
  const { user, profile } = useAuth();
  const [connectedTools, setConnectedTools] = useState<string[]>([]);
  const [connectingTool, setConnectingTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [analyzingTool, setAnalyzingTool] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.connected_tools) {
      const tools = Array.isArray(profile.connected_tools)
        ? profile.connected_tools
        : [];
      setConnectedTools(tools);
    }
  }, [profile]);

  const handleConnectTool = async (toolId: string) => {
    if (!user) return;
    if (connectedTools.includes(toolId)) return;

    setConnectingTool(toolId);

    try {
      const integration = await employeeProfileService.connectTool(user.id, toolId);

      const updatedTools = [...connectedTools, toolId];
      setConnectedTools(updatedTools);

      if (onToolsChange) {
        onToolsChange(updatedTools);
      }

      const tool = integrationsList.find((t) => t.id === toolId);
      if (tool && integration) {
        setAnalyzingTool(tool.name);
        (async () => {
          try {
            const problems = await aiAnalysisService.analyzeToolIntegration({
              userId: user.id,
              toolName: tool.name,
              integrationId: integration.id,
              toolCategory: tool.category,
              usageData: {
                connected_at: new Date().toISOString(),
                tool_id: toolId,
              },
            });

            if (problems.length > 0) {
              await aiAnalysisService.saveDetectedProblems(
                user.id,
                integration.id,
                tool.name,
                problems
              );
            }
          } catch (error) {
            console.error('Failed to analyze tool:', error);
          } finally {
            setTimeout(() => {
              setAnalyzingTool(null);
            }, 2000);
          }
        })();
      }

      setTimeout(() => {
        setConnectingTool(null);
      }, 800);
    } catch (error) {
      console.error('Failed to connect tool:', error);
      setConnectingTool(null);
    }
  };

  const handleDisconnectTool = async (toolId: string) => {
    if (!user) return;

    try {
      await employeeProfileService.disconnectTool(user.id, toolId);

      const updatedTools = connectedTools.filter((id) => id !== toolId);
      setConnectedTools(updatedTools);

      if (onToolsChange) {
        onToolsChange(updatedTools);
      }
    } catch (error) {
      console.error('Failed to disconnect tool:', error);
    }
  };

  const filteredTools =
    selectedCategory === 'all'
      ? integrationsList
      : integrationsList.filter((tool) => tool.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'communication', label: 'Communication' },
    { id: 'productivity', label: 'Productivité' },
    { id: 'files', label: 'Fichiers' },
    { id: 'crm', label: 'CRM' },
    { id: 'dev', label: 'Dev' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTools.map((tool, index) => {
          const IconComponent = iconMap[tool.icon] || Zap;
          const isConnected = connectedTools.includes(tool.id);
          const isConnecting = connectingTool === tool.id;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => {
                if (!isConnected && !isConnecting) {
                  handleConnectTool(tool.id);
                }
              }}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                isConnected
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-green-500/50 hover:border-green-500/70'
                  : isConnecting
                  ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/50 animate-pulse'
                  : 'bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50 grayscale hover:grayscale-0'
              }`}
            >
              {!isConnected && !isConnecting && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              )}

              {isConnecting && (
                <div className="absolute top-2 right-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              )}

              {isConnected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="absolute top-2 right-2"
                >
                  <div
                    className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50"
                    style={{ boxShadow: '0 0 12px rgba(0, 255, 136, 0.3)' }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    isConnected ? `bg-gradient-to-br ${tool.color}` : 'bg-slate-800/50'
                  }`}
                  style={
                    isConnected
                      ? {
                          boxShadow: `0 0 20px ${tool.color.includes('purple') ? 'rgba(168, 85, 247, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
                        }
                      : {}
                  }
                >
                  <IconComponent
                    className={`w-6 h-6 ${isConnected ? 'text-white' : 'text-slate-500'}`}
                  />
                </div>

                <h3
                  className={`text-sm font-semibold mb-1 ${
                    isConnected ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {tool.name}
                </h3>

                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Actif
                    </span>
                  </motion.div>
                )}

                {isConnecting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Connexion...
                    </span>
                  </motion.div>
                )}

                {!isConnected && !isConnecting && (
                  <p className="text-xs text-slate-500 mt-1">Cliquer pour connecter</p>
                )}
              </div>

              {isConnected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnectTool(tool.id);
                  }}
                  className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded text-xs text-red-400 opacity-0 hover:opacity-100 transition-opacity"
                >
                  Déconnecter
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {analyzingTool && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-400">
                Analyse IA en cours pour {analyzingTool}
              </p>
              <p className="text-xs text-slate-400">
                Détection automatique des problèmes et génération de recommandations...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {connectedTools.length} / {integrationsList.length} outils connectés
            </p>
            <p className="text-xs text-slate-400">
              {integrationsList.length - connectedTools.length} restants
            </p>
          </div>
        </div>

        {connectedTools.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Synchronisation active</span>
          </div>
        )}
      </div>
    </div>
  );
};
