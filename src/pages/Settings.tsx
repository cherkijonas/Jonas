import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Brain,
  Shield,
  Bell,
  Lock,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Activity,
  MessageSquare,
  Calendar,
  TrendingUp,
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
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { Language } from '../context/GlobalContext';

export const Settings = () => {
  const {
    userProfile,
    updateProfile,
    aiConfig,
    updateAIConfig,
    ethicsConfig,
    updateEthicsConfig,
    notificationsConfig,
    updateNotificationsConfig,
  } = useGlobal();

  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'ethics' | 'notifications' | 'team' | 'billing'>('profile');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
    }
  };

  const removeBlacklistTag = (tag: string) => {
    updateEthicsConfig({
      blacklistTags: ethicsConfig.blacklistTags.filter(t => t !== tag),
    });
  };

  const tabs = [
    { id: 'profile' as const, label: 'Mon Profil', icon: User },
    { id: 'ai' as const, label: 'Configuration IA', icon: Brain },
    { id: 'ethics' as const, label: 'Éthique & Privacy', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'team' as const, label: 'Membres de l\'équipe', icon: Users },
    { id: 'billing' as const, label: 'Abonnement', icon: CreditCard },
  ];

  const teamMembers = [
    { name: 'Jonas (Moi)', email: 'jonas@company.com', role: 'Super Admin', status: 'active' },
    { name: 'Thomas', email: 'thomas@company.com', role: 'Éditeur', status: 'active' },
    { name: 'Julie', email: 'julie@company.com', role: 'Lecteur Seul', status: 'pending' },
  ];

  const invoices = [
    { date: 'Décembre 2025', amount: '500€', status: 'Payée', id: 'INV-2025-12' },
    { date: 'Novembre 2025', amount: '500€', status: 'Payée', id: 'INV-2025-11' },
    { date: 'Octobre 2025', amount: '500€', status: 'Payée', id: 'INV-2025-10' },
  ];

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      handleSave();
      setShowInviteModal(false);
      setInviteEmail('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-slate-400">Configurez votre expérience InsightFlow</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="border-b border-slate-700/50">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Identité & Préférences</h2>
                <p className="text-sm text-slate-400">Gérez vos informations personnelles et vos préférences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Professionnel
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="w-full px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                    <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email verrouillé pour la sécurité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rôle
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-cyan-400">
                      {userProfile.role === 'Manager' ? 'MANAGER' : 'EMPLOYE'}
                    </span>
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                  >
                    <option value="Europe/Paris (GMT+1)">Europe/Paris (GMT+1)</option>
                    <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                    <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9)</option>
                    <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Essentiel pour des analyses précises</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Calibrage des Algorithmes</h2>
                <p className="text-sm text-slate-400">Ajustez la sensibilité et le périmètre de l'IA</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Sensibilité aux blocages
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-medium">BASSE</span>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiConfig.blockageSensitivity}
                        onChange={(e) => updateAIConfig({ blockageSensitivity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">HAUTE</span>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-semibold">
                      <Activity className="w-4 h-4" />
                      {aiConfig.blockageSensitivity}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Délai avant alerte "Tâche Zombie"
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={aiConfig.zombieTaskDelay}
                      onChange={(e) => updateAIConfig({ zombieTaskDelay: parseInt(e.target.value) })}
                      className="w-24 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-center font-semibold focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                    />
                    <span className="text-slate-400">jours</span>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Périmètre d'Analyse</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Analyser la Productivité</p>
                          <p className="text-sm text-slate-500">Jira, GitHub, Trello</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateAIConfig({ analyzeProductivity: !aiConfig.analyzeProductivity })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          aiConfig.analyzeProductivity ? 'bg-cyan-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiConfig.analyzeProductivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Analyser la Communication</p>
                          <p className="text-sm text-slate-500">Slack, Microsoft Teams</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateAIConfig({ analyzeCommunication: !aiConfig.analyzeCommunication })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          aiConfig.analyzeCommunication ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiConfig.analyzeCommunication ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-400">Analyser les Calendriers</p>
                          <p className="text-sm text-slate-500">Zoom, Outlook (Désactivé par choix)</p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 cursor-not-allowed"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-slate-500 translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ethics' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-xl">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Confidentialité & Droit à la Déconnexion</h2>
                  <p className="text-sm text-emerald-400/80 leading-relaxed">
                    InsightFlow respecte le RGPD et protège la vie privée de vos équipes. Vous gardez le contrôle total sur les données analysées.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        {ethicsConfig.maskSensitiveData ? (
                          <EyeOff className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">Masquage Automatique des Données Sensibles (PII)</p>
                        <p className="text-sm text-slate-500">Floute automatiquement emails, salaires, et informations personnelles</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateEthicsConfig({ maskSensitiveData: !ethicsConfig.maskSensitiveData })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        ethicsConfig.maskSensitiveData ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          ethicsConfig.maskSensitiveData ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {ethicsConfig.maskSensitiveData && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Protection active : Les données sensibles sont masquées dans toutes les analyses
                    </div>
                  )}
                </div>

                <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Mode "Droit à la Déconnexion"</p>
                        <p className="text-sm text-slate-500">Respecte les horaires de travail et ne surveille pas en dehors</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateEthicsConfig({ disconnectionMode: !ethicsConfig.disconnectionMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        ethicsConfig.disconnectionMode ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          ethicsConfig.disconnectionMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {ethicsConfig.disconnectionMode && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-sm font-medium text-slate-300">Ne jamais analyser entre :</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="time"
                          value={ethicsConfig.noAnalysisStart}
                          onChange={(e) => updateEthicsConfig({ noAnalysisStart: e.target.value })}
                          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                        />
                        <span className="text-slate-400">et</span>
                        <input
                          type="time"
                          value={ethicsConfig.noAnalysisEnd}
                          onChange={(e) => updateEthicsConfig({ noAnalysisEnd: e.target.value })}
                          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                        <AlertCircle className="w-4 h-4" />
                        Aucune analyse ne sera effectuée pendant ces heures
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Tag className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Liste d'Exclusion (Blacklist)</p>
                      <p className="text-sm text-slate-500">Exclure les canaux contenant ces mots-clés</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {ethicsConfig.blacklistTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeBlacklistTag(tag)}
                            className="hover:bg-red-500/20 rounded p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addBlacklistTag()}
                        placeholder="Ajouter un mot-clé..."
                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                      <button
                        onClick={addBlacklistTag}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium"
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
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Fréquence & Canaux</h2>
                <p className="text-sm text-slate-400">Choisissez comment et quand recevoir vos notifications</p>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-5 bg-slate-800/30 border rounded-xl transition-all cursor-pointer ${
                    notificationsConfig.weeklyReport
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                  onClick={() => updateNotificationsConfig({ weeklyReport: !notificationsConfig.weeklyReport })}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      notificationsConfig.weeklyReport
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-slate-600'
                    }`}>
                      {notificationsConfig.weeklyReport && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-white">Rapport Hebdomadaire</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Recevez un résumé complet des performances de votre équipe
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-700/50 rounded">Email</span>
                        <span>•</span>
                        <span>Lundi 09:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-5 bg-slate-800/30 border rounded-xl transition-all cursor-pointer ${
                    notificationsConfig.criticalAlerts
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                  onClick={() => updateNotificationsConfig({ criticalAlerts: !notificationsConfig.criticalAlerts })}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      notificationsConfig.criticalAlerts
                        ? 'bg-red-500 border-red-500'
                        : 'border-slate-600'
                    }`}>
                      {notificationsConfig.criticalAlerts && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <h3 className="font-semibold text-white">Alertes Blocage Critique</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Notification immédiate en cas de problème critique détecté
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-700/50 rounded">In-App seulement</span>
                        <span>•</span>
                        <span>Temps réel</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-5 bg-slate-800/30 border rounded-xl transition-all cursor-pointer ${
                    notificationsConfig.minorAlerts
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                  onClick={() => updateNotificationsConfig({ minorAlerts: !notificationsConfig.minorAlerts })}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      notificationsConfig.minorAlerts
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-slate-600'
                    }`}>
                      {notificationsConfig.minorAlerts && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-amber-400" />
                        <h3 className="font-semibold text-white">Alertes Mineures</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Notifications pour les suggestions et optimisations non urgentes
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-700/50 rounded">In-App seulement</span>
                        <span>•</span>
                        <span>Temps réel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Gérer les accès</h2>
                  <p className="text-sm text-slate-400">Invitez et gérez les membres de votre équipe</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Inviter un membre
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.email}
                    className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{member.name}</h3>
                            <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 font-medium">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.status === 'active' ? (
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium">
                            <Clock className="w-3 h-3" />
                            Invitation envoyée
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Abonnement & Facturation</h2>
                <p className="text-sm text-slate-400">Gérez votre plan et vos factures</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white">Plan Enterprise</h3>
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-medium">
                        Actif
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">Accès complet à toutes les fonctionnalités</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400">500€</div>
                    <div className="text-sm text-slate-400">par mois</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Utilisateurs</span>
                    <span className="text-sm font-semibold text-white">12 / 20</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: '60%' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">8 licences restantes</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Factures Récentes</h3>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg">
                          <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Facture {invoice.date}</h4>
                          <p className="text-sm text-slate-400">{invoice.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-white">{invoice.amount}</div>
                          <div className="text-xs text-green-400">{invoice.status}</div>
                        </div>
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Paramètres sauvegardés</span>
          </motion.div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          Sauvegarder les Modifications
        </button>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Inviter un membre</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email du membre
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemple@company.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
