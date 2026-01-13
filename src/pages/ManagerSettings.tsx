import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Lock,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Tag,
  X,
  Users,
  CreditCard,
  Mail,
  UserPlus,
  Download,
  FileText,
  Building2,
  Key,
  ArrowLeft,
  Crown,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Copy,
  RefreshCw,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../context/GlobalContext';
import { supabase } from '../lib/supabase';

interface TeamStats {
  total_teams: number;
  total_members: number;
  active_members: number;
  pending_requests: number;
}

export const ManagerSettings = () => {
  const navigate = useNavigate();
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const { user, profile } = useAuth();
  const {
    userProfile,
    updateProfile,
    ethicsConfig,
    updateEthicsConfig,
    notificationsConfig,
    updateNotificationsConfig,
  } = useGlobal();

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'ethics' | 'notifications' | 'team' | 'billing'>('profile');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeamStats>({
    total_teams: 0,
    total_members: 0,
    active_members: 0,
    pending_requests: 0,
  });
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user?.id || '');

      const teamIds = teams?.map(t => t.id) || [];

      const { count: totalMembers } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .in('team_id', teamIds);

      const { count: pendingRequests } = await supabase
        .from('team_join_requests')
        .select('*', { count: 'exact', head: true })
        .in('team_id', teamIds)
        .eq('status', 'pending');

      setStats({
        total_teams: teams?.length || 0,
        total_members: totalMembers || 0,
        active_members: totalMembers || 0,
        pending_requests: pendingRequests || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const addBlacklistTag = () => {
    if (newTag.trim() && !ethicsConfig.blacklistTags.includes(newTag.trim())) {
      updateEthicsConfig({
        blacklistTags: [...ethicsConfig.blacklistTags, newTag.trim()],
      });
      setNewTag('');
      handleSave();
    }
  };

  const removeBlacklistTag = (tag: string) => {
    updateEthicsConfig({
      blacklistTags: ethicsConfig.blacklistTags.filter(t => t !== tag),
    });
    handleSave();
  };

  const copyCompanyCode = () => {
    if (profile?.company_code) {
      navigator.clipboard.writeText(profile.company_code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Mon Profil', icon: User, color: 'from-cyan-500 to-blue-500' },
    { id: 'company' as const, label: 'Entreprise', icon: Building2, color: 'from-emerald-500 to-teal-500' },
    { id: 'ethics' as const, label: 'Éthique & Privacy', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, color: 'from-amber-500 to-orange-500' },
    { id: 'team' as const, label: 'Équipes', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'billing' as const, label: 'Abonnement', icon: CreditCard, color: 'from-rose-500 to-red-500' },
  ];

  const statCards = [
    {
      title: 'Équipes Gérées',
      value: loading ? '...' : stats.total_teams,
      icon: Users,
      gradient: 'from-cyan-500 to-blue-600',
      change: '+2 ce mois',
    },
    {
      title: 'Membres Actifs',
      value: loading ? '...' : stats.total_members,
      icon: Activity,
      gradient: 'from-emerald-500 to-teal-600',
      change: '+12 ce mois',
    },
    {
      title: 'Demandes en Attente',
      value: loading ? '...' : stats.pending_requests,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      change: '3 nouvelles',
    },
    {
      title: 'Taux d\'Engagement',
      value: '94%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600',
      change: '+5% ce mois',
    },
  ];

  const invoices = [
    { date: 'Décembre 2025', amount: '1,200€', status: 'Payée', id: 'INV-2025-12' },
    { date: 'Novembre 2025', amount: '1,200€', status: 'Payée', id: 'INV-2025-11' },
    { date: 'Octobre 2025', amount: '1,200€', status: 'Payée', id: 'INV-2025-10' },
  ];

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      handleSave();
      setShowInviteModal(false);
      setInviteEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/manager/${teamSlug}`)}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Paramètres Manager
                </h1>
                <p className="text-slate-400 mt-1">Configurez votre espace de gestion</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl backdrop-blur-xl">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-amber-400">Manager Access</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm mb-2">{stat.title}</div>
                <div className="text-emerald-400 text-xs font-medium">{stat.change}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          <div className="border-b border-slate-700/50 bg-slate-900/30">
            <div className="flex gap-2 p-3 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-20 rounded-xl border border-slate-600/50`}
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl">
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Profil Manager</h2>
                      <p className="text-sm text-cyan-400/80">Gérez vos informations personnelles et préférences</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nom Complet
                      </label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        disabled
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white backdrop-blur-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Professionnel
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-slate-400 cursor-not-allowed backdrop-blur-xl"
                        />
                        <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Email verrouillé pour la sécurité</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Rôle
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl backdrop-blur-xl">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <span className="font-semibold text-amber-400">Manager</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Globe className="inline w-4 h-4 mr-1" />
                        Langue
                      </label>
                      <select
                        value={userProfile.language}
                        onChange={(e) => updateProfile({ language: e.target.value as Language })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer backdrop-blur-xl"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Fuseau Horaire
                      </label>
                      <select
                        value={userProfile.timezone}
                        onChange={(e) => updateProfile({ timezone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer backdrop-blur-xl"
                      >
                        <option value="Europe/Paris (GMT+1)">Europe/Paris (GMT+1)</option>
                        <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                        <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9)</option>
                        <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Building2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Informations Entreprise</h2>
                      <p className="text-sm text-emerald-400/80">Gérez les paramètres globaux de votre organisation</p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">Code Entreprise</h3>
                        <p className="text-sm text-slate-400 mb-4">
                          Partagez ce code avec vos managers pour qu'ils rejoignent votre entreprise
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-xl">
                            <div className="font-mono text-3xl text-cyan-400 tracking-wider text-center font-bold">
                              {profile?.company_code || 'NON DÉFINI'}
                            </div>
                          </div>
                          <button
                            onClick={copyCompanyCode}
                            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
                          >
                            {copySuccess ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <Copy className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                        {copySuccess && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-emerald-400 mt-2 text-center"
                          >
                            Code copié dans le presse-papiers!
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nom de l'Entreprise
                      </label>
                      <input
                        type="text"
                        placeholder="Votre entreprise"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Secteur d'Activité
                      </label>
                      <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer backdrop-blur-xl">
                        <option>Technologie</option>
                        <option>Finance</option>
                        <option>Santé</option>
                        <option>Commerce</option>
                        <option>Autre</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nombre d'Employés
                      </label>
                      <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer backdrop-blur-xl">
                        <option>1-10</option>
                        <option>11-50</option>
                        <option>51-200</option>
                        <option>201-500</option>
                        <option>500+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ethics' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-2xl">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-2">Confidentialité & RGPD</h2>
                      <p className="text-sm text-green-400/80 leading-relaxed">
                        Paramètres globaux de confidentialité pour toute l'entreprise
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl transition-all ${ethicsConfig.maskSensitiveData ? 'bg-cyan-500/20' : 'bg-slate-700/30'}`}>
                            {ethicsConfig.maskSensitiveData ? (
                              <EyeOff className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">Masquage Données Sensibles</p>
                            <p className="text-sm text-slate-500">Protection automatique des PII</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            updateEthicsConfig({ maskSensitiveData: !ethicsConfig.maskSensitiveData });
                            handleSave();
                          }}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                            ethicsConfig.maskSensitiveData ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                          }`}
                        >
                          <motion.span
                            layout
                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
                            animate={{
                              x: ethicsConfig.maskSensitiveData ? 30 : 4,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {ethicsConfig.maskSensitiveData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Protection active pour toute l'entreprise
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl transition-all ${ethicsConfig.disconnectionMode ? 'bg-amber-500/20' : 'bg-slate-700/30'}`}>
                            <Clock className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Droit à la Déconnexion</p>
                            <p className="text-sm text-slate-500">Horaires de non-surveillance</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            updateEthicsConfig({ disconnectionMode: !ethicsConfig.disconnectionMode });
                            handleSave();
                          }}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                            ethicsConfig.disconnectionMode ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-slate-700'
                          }`}
                        >
                          <motion.span
                            layout
                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
                            animate={{
                              x: ethicsConfig.disconnectionMode ? 30 : 4,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {ethicsConfig.disconnectionMode && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 mt-4 pt-4 border-t border-slate-700/50"
                          >
                            <p className="text-sm font-medium text-slate-300">Horaires interdits :</p>
                            <div className="flex items-center gap-4">
                              <input
                                type="time"
                                value={ethicsConfig.noAnalysisStart}
                                onChange={(e) => updateEthicsConfig({ noAnalysisStart: e.target.value })}
                                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer backdrop-blur-xl"
                              />
                              <span className="text-slate-400">à</span>
                              <input
                                type="time"
                                value={ethicsConfig.noAnalysisEnd}
                                onChange={(e) => updateEthicsConfig({ noAnalysisEnd: e.target.value })}
                                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer backdrop-blur-xl"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20">
                              <AlertCircle className="w-4 h-4" />
                              S'applique à toutes les équipes
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                          <Tag className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Liste d'Exclusion</p>
                          <p className="text-sm text-slate-500">Canaux à exclure de l'analyse</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {ethicsConfig.blacklistTags.map((tag) => (
                            <motion.div
                              key={tag}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => removeBlacklistTag(tag)}
                                className="hover:bg-red-500/20 rounded p-1 transition-all hover:scale-110 active:scale-95"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addBlacklistTag()}
                            placeholder="Ajouter un mot-clé..."
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all backdrop-blur-xl"
                          />
                          <button
                            onClick={addBlacklistTag}
                            className="px-6 py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-rose-500/30 transition-all font-medium"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Bell className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Notifications Manager</h2>
                      <p className="text-sm text-amber-400/80">Gérez vos alertes et rapports d'équipe</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'weeklyReport',
                        title: 'Rapport Hebdomadaire Entreprise',
                        description: 'Synthèse complète des performances de toutes les équipes',
                        icon: Mail,
                        color: 'cyan',
                        details: 'Email • Lundi 08:00',
                      },
                      {
                        id: 'criticalAlerts',
                        title: 'Alertes Critiques Équipes',
                        description: 'Notification immédiate des blocages critiques',
                        icon: AlertCircle,
                        color: 'red',
                        details: 'Email + In-App • Temps réel',
                      },
                      {
                        id: 'minorAlerts',
                        title: 'Demandes & Suggestions',
                        description: 'Notifications des demandes de transfert et optimisations',
                        icon: Bell,
                        color: 'amber',
                        details: 'In-App seulement • Temps réel',
                      },
                    ].map((notif) => {
                      const isEnabled = notificationsConfig[notif.id as keyof typeof notificationsConfig];
                      const Icon = notif.icon;
                      return (
                        <motion.div
                          key={notif.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => {
                            updateNotificationsConfig({ [notif.id]: !isEnabled });
                            handleSave();
                          }}
                          className={`p-6 border rounded-2xl transition-all cursor-pointer backdrop-blur-xl ${
                            isEnabled
                              ? `border-${notif.color}-500/50 bg-${notif.color}-500/5`
                              : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isEnabled
                                ? `bg-${notif.color}-500 border-${notif.color}-500`
                                : 'border-slate-600'
                            }`}>
                              {isEnabled && <CheckCircle2 className="w-5 h-5 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Icon className={`w-5 h-5 text-${notif.color}-400`} />
                                <h3 className="font-semibold text-white">{notif.title}</h3>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{notif.description}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="px-2 py-1 bg-slate-700/50 rounded">{notif.details.split('•')[0].trim()}</span>
                                <span>•</span>
                                <span>{notif.details.split('•')[1].trim()}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl flex-1">
                      <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Gestion des Équipes</h2>
                        <p className="text-sm text-purple-400/80">Statistiques et membres en temps réel</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Inviter un Manager d'Équipe
                  </button>

                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Gérez vos équipes depuis le</p>
                    <button
                      onClick={() => navigate(`/manager/${teamSlug}`)}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Tableau de Bord Manager
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-2xl">
                    <div className="p-3 bg-rose-500/20 rounded-xl">
                      <CreditCard className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Abonnement Entreprise</h2>
                      <p className="text-sm text-rose-400/80">Gérez votre plan et consultez vos factures</p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-3xl font-bold text-white">Plan Enterprise Pro</h3>
                          <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-400 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Actif
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">Accès illimité - Gestion multi-équipes</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1,200€</div>
                        <div className="text-sm text-slate-400">par mois</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Managers Actifs</span>
                        <span className="text-sm font-semibold text-white">8 / 15</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '53%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">7 licences manager restantes</p>
                    </div>
                  </motion.div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Factures Récentes
                    </h3>
                    <div className="space-y-3">
                      {invoices.map((invoice, index) => (
                        <motion.div
                          key={invoice.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all backdrop-blur-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                              <FileText className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Facture {invoice.date}</h4>
                              <p className="text-sm text-slate-400">{invoice.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-white text-lg">{invoice.amount}</div>
                              <div className="text-xs text-green-400">{invoice.status}</div>
                            </div>
                            <button className="p-3 hover:bg-slate-700 rounded-xl transition-all hover:scale-110 active:scale-95 text-cyan-400 hover:text-cyan-300">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-end gap-4"
        >
          <AnimatePresence>
            {showSaveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/30 backdrop-blur-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Paramètres sauvegardés!</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Save className="w-5 h-5" />
            Sauvegarder les Modifications
          </button>
        </motion.div>

        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <UserPlus className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Inviter un Manager</h2>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email du Manager
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="manager@company.com"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-xl"
                      onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleInviteMember}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Envoyer l'invitation
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
