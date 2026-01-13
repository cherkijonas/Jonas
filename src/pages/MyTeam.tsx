import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, Send, CheckCircle, XCircle, Clock, X, Trash2, AlertCircle, ClipboardList, Package, Calendar, Headphones, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { transferRequestService, TransferRequest } from '../services/transferRequestService';
import { employeeRequestsService, EmployeeRequest } from '../services/employeeRequestsService';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  role: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  message?: string;
  created_at: string;
  reviewed_at?: string;
  teams?: {
    name: string;
    slug: string;
  };
}

const requestTypeIcons = {
  time_off: Calendar,
  resource: Package,
  equipment: Package,
  support: Headphones,
  other: MoreHorizontal,
};

const requestTypeLabels = {
  time_off: 'Congé',
  resource: 'Ressource',
  equipment: 'Équipement',
  support: 'Support',
  other: 'Autre',
};

export const MyTeam = () => {
  const { user, teamId } = useAuth();
  const navigate = useNavigate();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [myRequests, setMyRequests] = useState<TransferRequest[]>([]);
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<TransferRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<TransferRequest | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      setError('');
      setSuccess('');
    };
  }, []);

  const loadData = async () => {
    try {
      if (!user) return;

      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, slug)')
        .eq('user_id', user.id)
        .maybeSingle();

      const userTeamId = teamId || membership?.team_id;

      if (userTeamId) {
        const { data: team } = await supabase
          .from('teams')
          .select('*')
          .eq('id', userTeamId)
          .single();
        setCurrentTeam(team);

        const { data: members } = await supabase
          .from('team_members')
          .select('id, role, profiles(full_name, email)')
          .eq('team_id', userTeamId);
        setTeamMembers(members || []);

        const { data: allTeams } = await supabase
          .from('teams')
          .select('*')
          .neq('id', userTeamId);
        setAvailableTeams(allTeams || []);
      } else {
        const { data: allTeams } = await supabase
          .from('teams')
          .select('*');
        setAvailableTeams(allTeams || []);
      }

      const requests = await transferRequestService.getMyTransferRequests(user.id);
      setMyRequests(requests);

      const empRequests = await employeeRequestsService.getMyRequests();
      setEmployeeRequests(empRequests.slice(0, 5));

      const jRequests = await teamJoinRequestsService.getUserJoinRequests();
      setJoinRequests(jRequests || []);
    } catch (err) {
      console.error('Error loading data:', err);
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

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTeam) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await transferRequestService.createTransferRequest(
        user.id,
        currentTeam?.id || null,
        selectedTeam,
        message
      );
      setSuccess('Demande envoyée avec succès!');
      setShowTransferModal(false);
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

  const handleDeleteRequest = (request: TransferRequest) => {
    setRequestToDelete(request);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete || !user) return;

    setDeleting(true);
    setError('');

    try {
      await transferRequestService.deleteTransferRequest(requestToDelete.id, user.id);
      setSuccess('Demande supprimée avec succès');
      setShowDeleteConfirmModal(false);
      setRequestToDelete(null);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Erreur lors de la suppression de la demande');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full">
            <XCircle className="w-3 h-3" />
            Refusé
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewRequestDetail = (request: TransferRequest) => {
    setSelectedRequestDetail(request);
    setShowRequestDetailModal(true);
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mon Équipe</h1>
        <p className="text-slate-400">Collaborez et évoluez avec votre équipe</p>
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
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {success}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                {currentTeam?.name || 'Mon Équipe'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {currentTeam ? `Annuaire de l'équipe (${teamMembers.length} membres)` : 'Aucune équipe'}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {!currentTeam ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Vous ne faites pas encore partie d'une équipe</p>
                <p className="text-sm">Envoyez une demande pour rejoindre une équipe</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Aucun membre dans cette équipe</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold truncate">
                        {member.profiles.full_name}
                      </div>
                      <div className="text-slate-400 text-sm truncate">
                        {member.profiles.email}
                      </div>
                    </div>
                    <span className="ml-3 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30 whitespace-nowrap">
                      {member.role === 'owner' ? 'Propriétaire' : member.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Rejoindre une Équipe
            </h3>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Faites une demande d'adhésion pour rejoindre une équipe. Les managers examineront votre demande.
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              disabled={availableTeams.length === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Demander à Rejoindre une Équipe
            </button>
            {availableTeams.length === 0 && (
              <p className="text-xs text-slate-500 mt-2 text-center">Aucune équipe disponible pour l'instant</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              Mes Demandes d'Adhésion
              <span className="text-sm font-normal text-slate-400">
                ({joinRequests.length})
              </span>
            </h3>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {joinRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune demande d'adhésion</p>
                </div>
              ) : (
                joinRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                        <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{request.teams?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    {request.message && (
                      <p className="text-slate-400 text-sm italic line-clamp-1 mb-2">"{request.message}"</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-slate-500 text-xs">
                        {new Date(request.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      {request.status === 'approved' && (
                        <span className="text-xs text-green-400">✓ Acceptée</span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-xs text-red-400">✗ Refusée</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Mes Demandes Récentes
                <span className="text-sm font-normal text-slate-400">
                  ({employeeRequests.length})
                </span>
              </h3>
              <button
                onClick={() => navigate('/app/my-requests')}
                className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {employeeRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-3">Aucune demande</p>
                  <button
                    onClick={() => navigate('/app/my-requests')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                  >
                    Créer une demande
                  </button>
                </div>
              ) : (
                employeeRequests.map((request) => {
                  const TypeIcon = requestTypeIcons[request.type];
                  const statusColors = {
                    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    approved: 'bg-green-500/10 text-green-400 border-green-500/30',
                    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
                  };
                  const statusIcons = {
                    pending: Clock,
                    approved: CheckCircle,
                    rejected: XCircle,
                  };
                  const StatusIcon = statusIcons[request.status];

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate('/app/my-requests')}
                      className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm truncate">{request.title}</h4>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs flex-shrink-0 ${statusColors[request.status]}`}>
                              <StatusIcon className="w-3 h-3" />
                              {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvée' : 'Refusée'}
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs mb-1">{requestTypeLabels[request.type]}</p>
                          <p className="text-slate-500 text-xs">
                            {new Date(request.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          {request.manager_response && request.status !== 'pending' && (
                            <div className="mt-2 text-xs text-slate-400 italic line-clamp-1">
                              Réponse: {request.manager_response}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Demande d'Adhésion à une Équipe
              </h2>
              <form onSubmit={handleSendJoinRequest} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Équipe souhaitée
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px] resize-none"
                    required
                    disabled={sending}
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">{message.length}/500 caractères</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setMessage('');
                      setSelectedTeam('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all"
                    disabled={sending}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg py-3 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={sending || !selectedTeam || !message.trim()}
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showTransferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentTeam ? 'Demander un Transfert' : 'Rejoindre une Équipe'}
              </h2>
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Équipe souhaitée
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px] resize-none"
                    required
                    disabled={sending}
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">{message.length}/500 caractères</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferModal(false);
                      setMessage('');
                      setSelectedTeam('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all"
                    disabled={sending}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg py-3 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={sending || !selectedTeam || !message.trim()}
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showRequestDetailModal && selectedRequestDetail && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Détails de la Demande
                  </h2>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedRequestDetail.status)}
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestDetailModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-1">Équipe actuelle</div>
                  <div className="text-white font-semibold">
                    {selectedRequestDetail.from_team?.name || 'Aucune équipe'}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-cyan-400" />
                </div>

                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl">
                  <div className="text-sm text-slate-400 mb-1">Équipe souhaitée</div>
                  <div className="text-white font-semibold">
                    {selectedRequestDetail.to_team?.name}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-2">Message de motivation</div>
                  <div className="text-white italic">
                    "{selectedRequestDetail.message}"
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Date de soumission</div>
                    <div className="text-white">
                      {new Date(selectedRequestDetail.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>

                {selectedRequestDetail.reviewed_at && (
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Date de traitement</div>
                      <div className="text-white">
                        {new Date(selectedRequestDetail.reviewed_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {selectedRequestDetail.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowRequestDetailModal(false)}
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all font-semibold"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}

        {showDeleteConfirmModal && requestToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Confirmer la suppression
                  </h2>
                  <p className="text-slate-300 text-sm">
                    Voulez-vous vraiment supprimer cette demande de transfert vers l'équipe{' '}
                    <span className="font-semibold text-white">{requestToDelete.to_team?.name}</span> ?
                  </p>
                  <p className="text-red-400 text-sm mt-2">
                    Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl mb-6">
                <div className="text-sm text-slate-400 mb-1">Message de la demande</div>
                <p className="text-white italic text-sm">"{requestToDelete.message}"</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setRequestToDelete(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all font-semibold disabled:opacity-50"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg py-3 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    'Suppression...'
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
