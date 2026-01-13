import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Target,
  Zap,
  Sparkles,
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  role: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  message?: string;
  created_at: string;
  teams?: {
    name: string;
    slug: string;
  };
}

type ViewState = 'freelance' | 'member';

export const MyTeamV2 = () => {
  const { user, teamId, profile } = useAuth();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('freelance');
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('team-join-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[MyTeamV2] Real-time update:', payload);

          if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
            handleApprovalUpdate(payload.new);
          } else {
            loadData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleApprovalUpdate = async (updatedRequest: any) => {
    setSuccess('Votre demande a été approuvée! Bienvenue dans l\'équipe!');

    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', updatedRequest.team_id)
      .single();

    if (team) {
      setCurrentTeam(team);
      setViewState('member');
      await loadData();
    }

    setTimeout(() => setSuccess(''), 5000);
  };

  const loadData = async () => {
    try {
      if (!user) return;

      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, slug, description)')
        .eq('user_id', user.id)
        .maybeSingle();

      const userTeamId = teamId || membership?.team_id;

      if (userTeamId) {
        const { data: team } = await supabase
          .from('teams')
          .select('*')
          .eq('id', userTeamId)
          .single();

        if (team) {
          setCurrentTeam(team);
          setViewState('member');

          const { data: members } = await supabase
            .from('team_members')
            .select('id, role, profiles(full_name, email, avatar_url)')
            .eq('team_id', userTeamId);
          setTeamMembers(members || []);
        }

        const { data: allTeams } = await supabase
          .from('teams')
          .select('*')
          .neq('id', userTeamId);
        setAvailableTeams(allTeams || []);
      } else {
        setViewState('freelance');
        const { data: allTeams } = await supabase
          .from('teams')
          .select('*');
        setAvailableTeams(allTeams || []);
      }

      const jRequests = await teamJoinRequestsService.getUserJoinRequests();
      setJoinRequests(jRequests || []);
    } catch (err) {
      console.error('[MyTeamV2] Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSendJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await teamJoinRequestsService.createJoinRequest(selectedTeam, message);
      setSuccess('Demande d\'adhésion envoyée avec succès!');
      setShowJoinModal(false);
      setMessage('');
      setSelectedTeam('');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'envoi');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            EN ATTENTE
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            APPROUVÉ
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full font-medium">
            <XCircle className="w-3.5 h-3.5" />
            REFUSÉ
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Chargement de votre espace...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3 backdrop-blur-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 flex items-center gap-3 backdrop-blur-sm shadow-xl shadow-emerald-500/10"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {viewState === 'freelance' ? (
            <motion.div
              key="freelance"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm font-medium text-cyan-400 mb-4"
                >
                  <Sparkles size={16} />
                  Mode Freelance
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-3">Mon Espace</h1>
                <p className="text-slate-400 text-lg">Rejoignez une équipe pour débloquer toutes les fonctionnalités</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                        ACTION REQUISE
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">Rejoindre une Équipe</h2>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      Envoyez une demande d'adhésion à l'équipe de votre choix. Les managers examineront votre profil.
                    </p>

                    <button
                      onClick={() => setShowJoinModal(true)}
                      disabled={availableTeams.length === 0}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl py-4 px-6 font-semibold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      Demander à Rejoindre
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      Mes Demandes en Cours
                      <span className="text-sm font-normal text-slate-400">({joinRequests.length})</span>
                    </h3>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 styled-scrollbar">
                      {joinRequests.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                          <Send className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="text-sm">Aucune demande en cours</p>
                          <p className="text-xs mt-2 text-slate-500">Cliquez sur "Demander à Rejoindre" pour commencer</p>
                        </div>
                      ) : (
                        joinRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-semibold truncate">{request.teams?.name}</span>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>
                            {request.message && (
                              <p className="text-slate-400 text-sm italic line-clamp-2 mb-3 pl-10">"{request.message}"</p>
                            )}
                            <div className="text-slate-500 text-xs pl-10">
                              {new Date(request.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="member"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400 mb-4"
                >
                  <Shield size={16} />
                  Membre de l'équipe
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-3">{currentTeam?.name}</h1>
                <p className="text-slate-400 text-lg">Collaborez avec votre équipe et atteignez vos objectifs</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">92</span>
                    </div>
                    <p className="text-slate-400 text-sm">Score Santé</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">8/12</span>
                    </div>
                    <p className="text-slate-400 text-sm">OKRs Atteints</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">24</span>
                    </div>
                    <p className="text-slate-400 text-sm">Victoires</p>
                  </div>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-cyan-400" />
                    Annuaire de l'Équipe
                    <span className="text-sm font-normal text-slate-400">({teamMembers.length})</span>
                  </h2>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 styled-scrollbar">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {getInitials(member.profiles.full_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">
                              {member.profiles.full_name}
                            </div>
                            <div className="text-slate-400 text-sm truncate">{member.profiles.email}</div>
                          </div>
                          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30 whitespace-nowrap">
                            {member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-amber-400" />
                    Flux de Victoires
                  </h2>

                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle, text: 'Sprint Q1 terminé avec 100% de complétion', time: 'Il y a 2h', color: 'emerald' },
                      { icon: Star, text: 'Nouveau record de vélocité atteint', time: 'Il y a 5h', color: 'amber' },
                      { icon: Award, text: 'Zéro anomalies détectées cette semaine', time: 'Il y a 1j', color: 'cyan' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 bg-${item.color}-500/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">{item.text}</p>
                            <p className="text-slate-500 text-xs">{item.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  Rejoindre une Équipe
                </h2>
                <form onSubmit={handleSendJoinRequest} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Équipe souhaitée
                    </label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      required
                      disabled={sending}
                    >
                      <option value="">Sélectionner une équipe</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Message de motivation
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Expliquez pourquoi vous souhaitez rejoindre cette équipe..."
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all min-h-[140px] resize-none"
                      required
                      disabled={sending}
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-2">{message.length}/500 caractères</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowJoinModal(false);
                        setMessage('');
                        setSelectedTeam('');
                      }}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white rounded-xl py-3 transition-all font-medium"
                      disabled={sending}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl py-3 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-cyan-500/20"
                      disabled={sending || !selectedTeam || !message.trim()}
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};
