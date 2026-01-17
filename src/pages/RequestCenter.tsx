import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
  Package,
  Headphones,
  Bell,
  Filter,
  Search,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { transferRequestService } from '../services/transferRequestService';
import { employeeRequestsService } from '../services/employeeRequestsService';
import { notificationsService } from '../services/notificationsService';

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  message?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
  teams?: { name: string };
}

interface TransferRequest {
  id: string;
  user_id: string;
  from_team_id: string | null;
  to_team_id: string;
  status: string;
  message?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
  from_team?: { name: string };
  to_team?: { name: string };
}

interface EmployeeRequest {
  id: string;
  user_id: string;
  type: 'time_off' | 'resource' | 'support' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  manager_comment?: string;
  profiles?: { full_name: string; email: string };
}

type ActiveTab = 'membership' | 'employee';

const requestTypeIcons = {
  time_off: Calendar,
  resource: Package,
  support: Headphones,
  other: MessageSquare,
};

export default function RequestCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('membership');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [declineComment, setDeclineComment] = useState('');
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllRequests();
    }
  }, [user]);

  const loadAllRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [joins, transfers, empReqs] = await Promise.all([
        teamJoinRequestsService.getAllJoinRequestsForManager(),
        transferRequestService.getAllTransferRequests(),
        employeeRequestsService.getAllEmployeeRequests()
      ]);

      setJoinRequests(joins || []);
      setTransferRequests(transfers || []);
      setEmployeeRequests(empReqs || []);
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJoin = async (request: JoinRequest) => {
    try {
      await teamJoinRequestsService.approveRequest(request.id, request.team_id, request.user_id);

      await notificationsService.createNotification(
        request.user_id,
        'Demande approuvée',
        `Votre demande d'adhésion à l'équipe ${request.teams?.name} a été approuvée!`,
        'request_approved',
        request.id
      );

      setSuccess('Demande d\'adhésion approuvée!');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeclineJoin = async (request: JoinRequest) => {
    setSelectedRequest({ ...request, type: 'join' });
    setShowDeclineModal(true);
  };

  const handleApproveTransfer = async (request: TransferRequest) => {
    try {
      await transferRequestService.approveTransferRequest(request.id, user!.id);

      await notificationsService.createNotification(
        request.user_id,
        'Demande approuvée',
        `Votre demande de transfert vers ${request.to_team?.name} a été approuvée!`,
        'request_approved',
        request.id
      );

      setSuccess('Demande de transfert approuvée!');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeclineTransfer = async (request: TransferRequest) => {
    setSelectedRequest({ ...request, type: 'transfer' });
    setShowDeclineModal(true);
  };

  const handleApproveEmployee = async (request: EmployeeRequest) => {
    try {
      await employeeRequestsService.updateRequestStatus(request.id, 'approved', user!.id);

      await notificationsService.createNotification(
        request.user_id,
        'Demande approuvée',
        `Votre demande "${request.title}" a été approuvée!`,
        'request_approved',
        request.id
      );

      setSuccess('Demande employé approuvée!');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeclineEmployee = async (request: EmployeeRequest) => {
    setSelectedRequest({ ...request, type: 'employee' });
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!selectedRequest) return;

    setDeclining(true);
    try {
      if (selectedRequest.type === 'join') {
        await teamJoinRequestsService.rejectRequest(selectedRequest.id);
        await notificationsService.createNotification(
          selectedRequest.user_id,
          'Demande refusée',
          `Votre demande d'adhésion a été refusée${declineComment ? ': ' + declineComment : ''}`,
          'request_declined',
          selectedRequest.id
        );
      } else if (selectedRequest.type === 'transfer') {
        await transferRequestService.rejectTransferRequest(selectedRequest.id, user!.id);
        await notificationsService.createNotification(
          selectedRequest.user_id,
          'Demande refusée',
          `Votre demande de transfert a été refusée${declineComment ? ': ' + declineComment : ''}`,
          'request_declined',
          selectedRequest.id
        );
      } else if (selectedRequest.type === 'employee') {
        await employeeRequestsService.updateRequestStatus(
          selectedRequest.id,
          'rejected',
          user!.id,
          declineComment
        );
        await notificationsService.createNotification(
          selectedRequest.user_id,
          'Demande refusée',
          `Votre demande "${selectedRequest.title}" a été refusée${declineComment ? ': ' + declineComment : ''}`,
          'request_declined',
          selectedRequest.id
        );
      }

      setSuccess('Demande refusée avec notification envoyée');
      setShowDeclineModal(false);
      setDeclineComment('');
      setSelectedRequest(null);
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec du refus');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeclining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };

    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvée' : 'Refusée'}
      </span>
    );
  };

  const filterRequests = (requests: any[]) => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const membershipCount = filterRequests([...joinRequests, ...transferRequests]).length;
  const employeeCount = filterRequests(employeeRequests).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/manager/${teamSlug}`)}
              className="p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="w-10 h-10 text-cyan-400" />
                Centre de Requêtes
              </h1>
              <p className="text-slate-400">Gérez toutes les demandes de votre équipe</p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}
          >
            {error || success}
          </motion.div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('membership')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'membership'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span>Adhésions & Transferts</span>
              {membershipCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {membershipCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'employee'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span>Demandes Employés</span>
              {employeeCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {employeeCount}
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'membership' && (
            <motion.div
              key="membership"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filterRequests([...joinRequests, ...transferRequests]).length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-12 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Aucune demande d'adhésion ou de transfert</p>
                </div>
              ) : (
                <>
                  {filterRequests(joinRequests).map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{request.profiles?.full_name}</h3>
                              <p className="text-slate-400 text-sm">{request.profiles?.email}</p>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                            <p className="text-cyan-400 text-sm mb-1">Demande d'adhésion à:</p>
                            <p className="text-white font-semibold">{request.teams?.name}</p>
                          </div>

                          {request.message && (
                            <div className="bg-slate-800/30 rounded-lg p-3 mb-3">
                              <p className="text-slate-400 text-sm mb-1">Message:</p>
                              <p className="text-slate-300 text-sm italic">"{request.message}"</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveJoin(request)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleDeclineJoin(request)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {filterRequests(transferRequests).map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{request.profiles?.full_name}</h3>
                              <p className="text-slate-400 text-sm">{request.profiles?.email}</p>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3 mb-3 flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-slate-400 text-xs">De:</p>
                              <p className="text-white font-medium">{request.from_team?.name || 'Aucune équipe'}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-cyan-400" />
                            <div className="flex-1">
                              <p className="text-slate-400 text-xs">Vers:</p>
                              <p className="text-white font-medium">{request.to_team?.name}</p>
                            </div>
                          </div>

                          {request.message && (
                            <div className="bg-slate-800/30 rounded-lg p-3 mb-3">
                              <p className="text-slate-400 text-sm mb-1">Message:</p>
                              <p className="text-slate-300 text-sm italic">"{request.message}"</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTransfer(request)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleDeclineTransfer(request)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'employee' && (
            <motion.div
              key="employee"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filterRequests(employeeRequests).length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Aucune demande employé</p>
                </div>
              ) : (
                filterRequests(employeeRequests).map((request) => {
                  const Icon = requestTypeIcons[request.type];

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{request.profiles?.full_name}</h3>
                              <p className="text-slate-400 text-sm">{request.profiles?.email}</p>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                {request.type === 'time_off' ? 'Congé' : request.type === 'resource' ? 'Ressource' : request.type === 'support' ? 'Support' : 'Autre'}
                              </span>
                            </div>
                            <p className="text-white font-semibold mb-1">{request.title}</p>
                            <p className="text-slate-300 text-sm">{request.description}</p>
                          </div>

                          {request.manager_comment && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-3">
                              <p className="text-amber-400 text-sm mb-1 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Commentaire du manager:
                              </p>
                              <p className="text-slate-300 text-sm">"{request.manager_comment}"</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveEmployee(request)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleDeclineEmployee(request)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Refuser la demande</h2>
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineComment('');
                    setSelectedRequest(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-300 mb-4 text-sm">
                Vous pouvez ajouter un commentaire pour expliquer pourquoi cette demande est refusée. L'employé recevra une notification.
              </p>

              <textarea
                value={declineComment}
                onChange={(e) => setDeclineComment(e.target.value)}
                placeholder="Ex: L'équipe est actuellement au complet. Veuillez réessayer le mois prochain."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] resize-none mb-4"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mb-4">{declineComment.length}/500 caractères</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineComment('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-3 transition-all"
                  disabled={declining}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDecline}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg py-3 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={declining}
                >
                  {declining ? 'Refus en cours...' : 'Confirmer le refus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
