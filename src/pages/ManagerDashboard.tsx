import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, Plus, Mail, Crown, Check, X, Clock, ArrowRight,
  Sparkles, Shield, RefreshCw, UserPlus, Trash2, ArrowLeft,
  Building2, TrendingUp, UserCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamsService } from '../services/teamsService';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { companyCodeService } from '../services/companyCodeService';
import { transferRequestService, TransferRequest } from '../services/transferRequestService';
import { supabase } from '../lib/supabase';
import { EmployeeRequestsManager } from '../components/dashboard/EmployeeRequestsManager';

interface Team {
  id: string;
  name: string;
  slug: string;
  role?: string;
  created_at?: string;
  member_count?: number;
}

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  message?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  teams?: {
    name: string;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const ManagerDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [assignedTeam, setAssignedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);


  const loadData = async () => {
    try {
      if (!user || !profile?.assigned_team_id) return;

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile.assigned_team_id)
        .single();

      if (teamError) throw teamError;

      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);

      setAssignedTeam({ ...team, member_count: count || 0 });

      const joinReqs = await teamJoinRequestsService.getTeamJoinRequests(team.id);
      setJoinRequests(joinReqs);

      const transferReqs = await transferRequestService.getTeamTransferRequests(team.id);
      setTransferRequests(transferReqs);

      await loadTeamDetails(team.id);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const { data: members } = await supabase
        .from('team_members')
        .select('id, user_id, team_id, role, profiles(full_name, email)')
        .eq('team_id', teamId);

      setTeamMembers(members || []);
    } catch (err) {
      console.error('Error loading team details:', err);
    }
  };


  const handleApproveRequest = async (request: JoinRequest) => {
    try {
      await teamJoinRequestsService.approveRequest(
        request.id,
        request.team_id,
        request.user_id
      );
      setSuccess('Demande approuvée!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await teamJoinRequestsService.rejectRequest(requestId);
      setSuccess('Demande rejetée');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du rejet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApproveTransferRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await transferRequestService.approveTransferRequest(requestId, user.id);
      setSuccess('Demande de transfert approuvée!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation du transfert');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectTransferRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await transferRequestService.rejectTransferRequest(requestId, user.id);
      setSuccess('Demande de transfert rejetée');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du rejet du transfert');
      setTimeout(() => setError(''), 3000);
    }
  };


  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${memberName} de l'équipe?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setSuccess('Membre retiré avec succès');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors de la suppression du membre');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatCards = () => {
    const totalMembers = assignedTeam?.member_count || 0;
    const pendingRequests = joinRequests.length + transferRequests.length;

    return [
      {
        title: 'Équipe',
        value: assignedTeam?.name || '',
        icon: Building2,
        gradient: 'from-amber-500 to-orange-600',
        change: 'Votre équipe assignée'
      },
      {
        title: 'Total Membres',
        value: totalMembers,
        icon: Users,
        gradient: 'from-cyan-500 to-blue-600',
        change: `dans ${assignedTeam?.name || 'l\'équipe'}`
      },
      {
        title: 'Demandes en attente',
        value: pendingRequests,
        icon: Clock,
        gradient: 'from-purple-500 to-pink-600',
        change: 'À traiter'
      },
      {
        title: 'Taux d\'approbation',
        value: '95%',
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-green-600',
        change: '+5% ce mois'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {assignedTeam?.name || 'Équipe'} - Tableau de Bord Manager
                  </h1>
                  <p className="text-slate-400 text-sm">Bienvenue, {profile?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/manager/${teamSlug}/requests`)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Mail className="w-4 h-4" />
                  Centre de Requêtes
                  {(joinRequests.length + transferRequests.length) > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {joinRequests.length + transferRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/manager/${teamSlug}/settings`)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Paramètres Manager
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl text-emerald-400 flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  {success}
                </div>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getStatCards().map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm mb-2">{stat.title}</div>
                <div className="text-slate-500 text-xs">{stat.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <UserCheck className="w-5 h-5" />
                Membres de l'Équipe
              </h2>

              {assignedTeam ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun membre</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white font-semibold">
                              {member.profiles?.full_name || 'Utilisateur'}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {member.profiles?.email}
                            </div>
                            <span className="inline-block mt-2 px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">
                              {member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre'}
                            </span>
                          </div>
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || 'ce membre')}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                              title="Retirer du groupe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Chargement de l'équipe...</p>
                </div>
              )}
            </motion.div>

            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5" />
                  Demandes d'Adhésion
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {joinRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune demande</p>
                    </div>
                  ) : (
                    joinRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {request.profiles?.full_name || 'Utilisateur'}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {request.profiles?.email}
                            </div>
                            {request.message && (
                              <div className="text-slate-400 text-xs mt-2 italic line-clamp-2">
                                "{request.message}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(request.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Rejeter
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <RefreshCw className="w-5 h-5" />
                  Demandes de Transfert
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {transferRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune demande</p>
                    </div>
                  ) : (
                    transferRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {request.profiles?.full_name || 'Utilisateur'}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {request.profiles?.email}
                            </div>
                            <div className="text-cyan-400 text-xs mt-1 flex items-center gap-1">
                              {request.from_team?.name || 'Nouvelle équipe'} <ArrowRight className="w-3 h-3" /> {request.to_team?.name}
                            </div>
                            {request.message && (
                              <div className="text-slate-400 text-xs mt-2 italic line-clamp-2">
                                "{request.message}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(request.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveTransferRequest(request.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleRejectTransferRequest(request.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-1 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Rejeter
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          >
            <EmployeeRequestsManager />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
