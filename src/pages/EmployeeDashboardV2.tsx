import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HealthScoreGauge } from '../components/employee/HealthScoreGauge';
import { ToolIntegrationGrid } from '../components/employee/ToolIntegrationGrid';
import { SuccessFeed } from '../components/employee/SuccessFeed';
import { EmployeeMetricsWidget } from '../components/employee/EmployeeMetricsWidget';
import { EmployeeGoalsWidget } from '../components/employee/EmployeeGoalsWidget';
import { ProductivityTrendChart } from '../components/employee/ProductivityTrendChart';
import { TeamMembersGrid } from '../components/employee/TeamMembersGrid';
import { FeedbackWidget } from '../components/employee/FeedbackWidget';
import { ActivityTimeline } from '../components/employee/ActivityTimeline';
import { EmployeeQuickActions } from '../components/employee/EmployeeQuickActions';
import { AIProblemsPanel } from '../components/employee/AIProblemsPanel';
import { SolvedProblemsWidget } from '../components/employee/SolvedProblemsWidget';
import { employeeProfileService } from '../services/employeeProfileService';

export const EmployeeDashboardV2 = () => {
  const { user, profile } = useAuth();
  const [healthScore, setHealthScore] = useState(0);
  const [connectedToolsCount, setConnectedToolsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'team'>('dashboard');

  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    try {
      const userProfile = await employeeProfileService.getProfile(user!.id);
      const connectedTools = await employeeProfileService.getConnectedTools(user!.id);

      setHealthScore(userProfile?.health_score || 0);
      setConnectedToolsCount(connectedTools.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolsChange = async (tools: string[]) => {
    setConnectedToolsCount(tools.length);

    const updatedProfile = await employeeProfileService.getProfile(user!.id);
    if (updatedProfile) {
      setHealthScore(updatedProfile.health_score);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'insights', label: 'Insights', icon: Target },
    { id: 'team', label: 'Mon Équipe', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bonjour, {profile?.full_name?.split(' ')[0] || 'Employé'}
            </h1>
            <p className="text-slate-400">
              Gérez vos outils et suivez votre performance opérationnelle
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-slate-800 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 rounded-lg"
                      style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Score de Santé IA</h2>
                  <p className="text-sm text-slate-400">
                    Analyse en temps réel de votre écosystème d'outils
                  </p>
                </div>
              </div>

              <HealthScoreGauge score={healthScore} connectedToolsCount={connectedToolsCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Intégrations d'Outils</h2>
                      <p className="text-sm text-slate-400">
                        Connectez vos outils pour une analyse complète
                      </p>
                    </div>
                  </div>

                  <ToolIntegrationGrid onToolsChange={handleToolsChange} />
                </div>

                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <ActivityTimeline userId={user!.id} limit={5} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <SuccessFeed userId={user!.id} />
                </div>

                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <EmployeeQuickActions
                    hasTeam={!!profile?.assigned_team_id}
                    pendingRequestsCount={0}
                  />
                </div>

                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <FeedbackWidget userId={user!.id} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Insights & Analytics</h2>
                  <p className="text-sm text-slate-400">
                    Analyse respectueuse de la vie privée - métadonnées uniquement
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <EmployeeMetricsWidget userId={user!.id} />
                <EmployeeGoalsWidget userId={user!.id} />
              </div>

              <ProductivityTrendChart userId={user!.id} />
            </div>

            {connectedToolsCount >= 1 && (
              <>
                <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Analyse IA des Outils</h2>
                      <p className="text-sm text-slate-400">
                        Problèmes détectés et recommandations intelligentes
                      </p>
                    </div>
                  </div>

                  <AIProblemsPanel userId={user!.id} />
                </div>

                <SolvedProblemsWidget userId={user!.id} />
              </>
            )}

            {connectedToolsCount < 1 && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-8">
                <div className="text-center">
                  <Target className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Débloquez l'analyse IA
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Connectez au moins 1 outil pour débloquer l'analyse automatique des frictions et recevoir des recommandations personnalisées par IA
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mon Équipe</h2>
                <p className="text-sm text-slate-400">
                  {profile?.assigned_team_id
                    ? 'Collaborez avec votre équipe'
                    : 'Rejoignez une équipe pour collaborer'}
                </p>
              </div>
            </div>

            {profile?.assigned_team_id ? (
              <TeamMembersGrid teamId={profile.assigned_team_id} currentUserId={user!.id} />
            ) : (
              <div className="text-center py-20">
                <Sparkles className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Pas encore d'équipe
                </h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  Visitez la page "Mon Équipe" pour rejoindre ou créer une équipe et collaborer avec vos collègues
                </p>
                <button
                  onClick={() => window.location.href = '/my-team'}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all"
                >
                  Explorer les Équipes
                </button>
              </div>
            )}
          </motion.div>
        )}
    </div>
  );
};
