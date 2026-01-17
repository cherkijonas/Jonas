import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Settings, Trash2, UserPlus, UserMinus,
  Crown, Shield, Search, MoreVertical, Mail, Check, X, ArrowRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamsService } from '../services/teamsService';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { transferRequestService, TransferRequest } from '../services/transferRequestService';
import { supabase } from '../lib/supabase';

interface Team {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
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
}

export const Teams = () => {
  const { user, profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamDetails();
    }
  }, [selectedTeam]);

  useEffect(() => {
    return () => {
      setError('');
      setSuccess('');
    };
  }, []);

  const loadTeams = async () => {
    try {
      if (!user) return;
      const userTeams = await teamsService.getUserTeams(user.id);
      setTeams(userTeams);
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Erreur lors du chargement des équipes');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async () => {
    if (!selectedTeam) return;

    try {
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*, profiles(full_name, email)')
        .eq('team_id', selectedTeam.id);

      if (membersError) throw membersError;
      setTeamMembers(members || []);

      if (isManager) {
        const requests = await teamJoinRequestsService.getTeamJoinRequests(selectedTeam.id);
        setJoinRequests(requests);

        const transfers = await transferRequestService.getTeamTransferRequests(selectedTeam.id);
        setTransferRequests(transfers);
      }
    } catch (err) {
      console.error('Error loading team details:', err);
      setError('Erreur lors du chargement des détails de l\'équipe');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !user) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const team = await teamsService.createTeam(teamName, slug, user.id);
      setSuccess('Équipe créée avec succès!');
      setTeamName('');
      setShowCreateModal(false);
      await loadTeams();
      setSelectedTeam(team);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de la création');
      setTimeout(() => setError(''), 5000);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe? Tous les membres seront retirés.')) return;

    try {
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;

      setSuccess('Équipe supprimée avec succès');
      setSelectedTeam(null);
      await loadTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${memberName} de l'équipe?`)) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      setSuccess('Membre retiré avec succès');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du retrait');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      setSuccess('Rôle mis à jour avec succès');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleApproveRequest = async (request: JoinRequest) => {
    try {
      await teamJoinRequestsService.approveRequest(
        request.id,
        request.team_id,
        request.user_id
      );
      setSuccess('Demande approuvée avec succès');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await teamJoinRequestsService.rejectRequest(requestId);
      setSuccess('Demande rejetée');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du rejet');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleApproveTransfer = async (request: TransferRequest) => {
    if (!user) return;
    try {
      await transferRequestService.approveTransferRequest(request.id, user.id);
      setSuccess('Transfert approuvé avec succès');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation du transfert');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRejectTransfer = async (requestId: string) => {
    if (!user) return;
    try {
      await transferRequestService.rejectTransferRequest(requestId, user.id);
      setSuccess('Transfert refusé');
      await loadTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du refus du transfert');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Équipes</h1>
          <p className="text-slate-400 mt-1">
            {isManager
              ? 'Gérez vos équipes et leurs membres'
              : 'Consultez vos équipes et demandez à en rejoindre de nouvelles'}
          </p>
        </div>
        {isManager && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Créer une Équipe
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl text-emerald-400 flex items-center gap-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                {success}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mes Équipes
            <span className="ml-auto text-sm font-normal text-slate-400">
              ({teams.length})
            </span>
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {teams.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">Aucune équipe</p>
                <p className="text-sm">
                  {isManager ? 'Créez votre première équipe' : 'Rejoignez une équipe'}
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <motion.button
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full p-4 rounded-xl transition-all text-left ${
                    selectedTeam?.id === team.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-2 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                      <span className="text-white font-bold">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold truncate">{team.name}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(team.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    {selectedTeam?.id === team.id && (
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {selectedTeam ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Membres
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({teamMembers.length})
                  </span>
                </h2>
                {isManager && (
                  <button
                    onClick={() => handleDeleteTeam(selectedTeam.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    title="Supprimer l'équipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun membre dans cette équipe</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate">
                            {member.profiles?.full_name || 'Utilisateur'}
                          </div>
                          <div className="text-slate-400 text-sm truncate">
                            {member.profiles?.email}
                          </div>
                        </div>
                        {isManager && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.profiles?.full_name || 'ce membre')}
                            className="ml-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                            title="Retirer du groupe"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {isManager ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                          disabled={member.role === 'owner'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="member">Membre</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Propriétaire</option>
                        </select>
                      ) : (
                        <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30 inline-block">
                          {member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Demandes
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({joinRequests.length + transferRequests.length})
                </span>
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {joinRequests.length === 0 && transferRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune demande en attente</p>
                  </div>
                ) : (
                  <>
                    {joinRequests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Demandes d'Adhésion ({joinRequests.length})
                        </h3>
                        <div className="space-y-2">
                          {joinRequests.map((request) => (
                            <div
                              key={request.id}
                              className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
                            >
                              <div className="mb-3">
                                <div className="text-white font-semibold">
                                  {request.profiles?.full_name || 'Utilisateur'}
                                </div>
                                <div className="text-slate-400 text-sm">
                                  {request.profiles?.email}
                                </div>
                                {request.message && (
                                  <div className="text-slate-400 text-sm mt-2 p-2 bg-slate-900/50 rounded italic">
                                    "{request.message}"
                                  </div>
                                )}
                              </div>
                              {isManager && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveRequest(request)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Approuver
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Rejeter
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {transferRequests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Demandes de Transfert ({transferRequests.length})
                        </h3>
                        <div className="space-y-2">
                          {transferRequests.map((request) => (
                            <div
                              key={request.id}
                              className="p-4 bg-cyan-500/5 border border-cyan-500/30 rounded-xl"
                            >
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-white font-semibold">
                                    {request.profiles?.full_name || 'Utilisateur'}
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="text-slate-400 text-sm">
                                  {request.profiles?.email}
                                </div>
                                <div className="text-cyan-400 text-xs mt-1">
                                  De: {request.from_team?.name || 'Aucune équipe'}
                                </div>
                                {request.message && (
                                  <div className="text-slate-400 text-sm mt-2 p-2 bg-slate-800/50 rounded italic">
                                    "{request.message}"
                                  </div>
                                )}
                              </div>
                              {isManager && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveTransfer(request)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Approuver
                                  </button>
                                  <button
                                    onClick={() => handleRejectTransfer(request.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Refuser
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-12 flex items-center justify-center"
          >
            <div className="text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Sélectionnez une équipe pour voir les détails</p>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Créer une Équipe</h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Nom de l'équipe
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Mon Équipe"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    disabled={creating}
                    maxLength={50}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setTeamName('');
                      setError('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all"
                    disabled={creating}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg py-3 transition-all disabled:opacity-50"
                    disabled={creating || !teamName.trim()}
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
