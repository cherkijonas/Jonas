import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Mail, UserPlus, Settings, Crown,
  Check, X, Clock, ArrowRight, Sparkles, Shield, ArrowLeft, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamsService } from '../services/teamsService';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { companyCodeService } from '../services/companyCodeService';
import { transferRequestService, TransferRequest } from '../services/transferRequestService';

interface Team {
  id: string;
  name: string;
  slug: string;
  role?: string;
  created_at?: string;
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

export const TeamManagement = () => {
  const { user, profile, setTeamId } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      if (!user) return;
      const userTeams = await teamsService.getUserTeams(user.id);
      setTeams(userTeams);

      const allJoinRequests: JoinRequest[] = [];
      const allTransferRequests: TransferRequest[] = [];

      for (const team of userTeams) {
        if (team.role === 'owner' || team.role === 'admin') {
          const joinReqs = await teamJoinRequestsService.getTeamJoinRequests(team.id);
          allJoinRequests.push(...joinReqs);

          const transferReqs = await transferRequestService.getTeamTransferRequests(team.id);
          allTransferRequests.push(...transferReqs);
        }
      }
      setJoinRequests(allJoinRequests);
      setTransferRequests(allTransferRequests);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
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
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Échec de la création de l\'équipe');
    } finally {
      setCreating(false);
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
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await teamJoinRequestsService.rejectRequest(requestId);
      setSuccess('Demande rejetée');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Échec du rejet');
    }
  };

  const handleApproveTransferRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await transferRequestService.approveTransferRequest(requestId, user.id);
      setSuccess('Demande de transfert approuvée!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation du transfert');
    }
  };

  const handleRejectTransferRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await transferRequestService.rejectTransferRequest(requestId, user.id);
      setSuccess('Demande de transfert rejetée');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Échec du rejet du transfert');
    }
  };

  const handleSelectTeam = (teamId: string) => {
    setTeamId(teamId);
    navigate('/app');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode.trim() || !user) return;

    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const company = await companyCodeService.getCompanyByCode(companyCode);

      if (!company) {
        setError('Code d\'entreprise invalide');
        setVerifying(false);
        return;
      }

      const teamName = company.company_name;
      const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const team = await teamsService.createTeam(teamName, slug, user.id);

      setSuccess(`Rejoint l'entreprise: ${company.company_name}!`);
      setCompanyCode('');
      setShowCodeForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Échec de la vérification du code');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <button
        onClick={() => navigate('/role-selection')}
        className="absolute top-6 left-6 z-10 p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Gestion des Équipes</h1>
              <p className="text-slate-400">Gérez vos équipes et les demandes d'adhésion</p>
            </div>
          </div>
        </motion.div>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl text-emerald-400">
                {success}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Code d'Entreprise
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Rejoignez une entreprise existante avec un code
              </p>
            </div>
            <button
              onClick={() => setShowCodeForm(!showCodeForm)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {showCodeForm ? 'Fermer' : 'Entrer un Code'}
            </button>
          </div>

          {showCodeForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleVerifyCode}
              className="p-4 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="Entrez le code (ex: FLUX2024)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-3"
                required
                disabled={verifying}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeForm(false);
                    setCompanyCode('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 transition-all"
                  disabled={verifying}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg py-2 transition-all disabled:opacity-50"
                  disabled={verifying || !companyCode.trim()}
                >
                  {verifying ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Mes Équipes
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                Créer
              </button>
            </div>

            {showCreateForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleCreateTeam}
                className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Nom de l'équipe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                  required
                  disabled={creating}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 transition-all"
                    disabled={creating}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg py-2 transition-all disabled:opacity-50"
                    disabled={creating || !teamName.trim()}
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-3">
              {teams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune équipe. Créez-en une!</p>
                </div>
              ) : (
                teams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectTeam(team.id)}
                    className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{team.name}</div>
                          {team.role && (
                            <div className="text-slate-400 text-sm capitalize">{team.role}</div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Mail className="w-6 h-6" />
              Demandes d'Adhésion
            </h2>

            <div className="space-y-3">
              {joinRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune demande en attente</p>
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
                        <div className="text-white font-semibold">
                          {request.profiles?.full_name || 'Utilisateur'}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {request.profiles?.email}
                        </div>
                        {request.message && (
                          <div className="text-slate-400 text-sm mt-2 italic">
                            "{request.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <RefreshCw className="w-6 h-6" />
              Demandes de Transfert
            </h2>

            <div className="space-y-3">
              {transferRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune demande de transfert</p>
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
                        <div className="text-white font-semibold">
                          {request.profiles?.full_name || 'Utilisateur'}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {request.profiles?.email}
                        </div>
                        <div className="text-cyan-400 text-xs mt-1 flex items-center gap-1">
                          {request.from_team?.name || 'Nouvelle équipe'} <ArrowRight className="w-3 h-3" /> {request.to_team?.name}
                        </div>
                        {request.message && (
                          <div className="text-slate-400 text-sm mt-2 italic">
                            "{request.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveTransferRequest(request.id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectTransferRequest(request.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2"
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
    </div>
  );
};
