import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
  Package,
  Headphones,
  Filter,
  Search,
  X,
  Send,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { teamJoinRequestsService } from '../services/teamJoinRequestsService';
import { transferRequestService } from '../services/transferRequestService';
import { employeeRequestsService } from '../services/employeeRequestsService';
import { notificationsService } from '../services/notificationsService';
import { supabase } from '../lib/supabase';

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

interface EmployeeRequest {
  id: string;
  user_id: string;
  type: 'time_off' | 'resource' | 'equipment' | 'support' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  manager_response?: string;
  profiles?: { full_name: string; email: string };
}

type ActiveTab = 'membership' | 'admin';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const requestTypeIcons = {
  time_off: Calendar,
  resource: Package,
  equipment: Package,
  support: Headphones,
  other: MessageSquare,
};

const requestTypeLabels = {
  time_off: 'Congé',
  resource: 'Ressource',
  equipment: 'Équipement',
  support: 'Support',
  other: 'Autre',
};

export default function RequestCenterV2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('membership');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [declineComment, setDeclineComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllRequests();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    const joinRequestsChannel = supabase
      .channel('join-requests-manager')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_join_requests'
        },
        (payload) => {
          console.log('[RequestCenter] Join request update:', payload);
          loadAllRequests();
        }
      )
      .subscribe();

    const employeeRequestsChannel = supabase
      .channel('employee-requests-manager')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_requests'
        },
        (payload) => {
          console.log('[RequestCenter] Employee request update:', payload);
          loadAllRequests();
        }
      )
      .subscribe();

    return () => {
      joinRequestsChannel.unsubscribe();
      employeeRequestsChannel.unsubscribe();
    };
  };

  const loadAllRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [joins, empReqs] = await Promise.all([
        teamJoinRequestsService.getAllJoinRequestsForManager(),
        employeeRequestsService.getAllEmployeeRequests()
      ]);

      setJoinRequests(joins || []);
      setEmployeeRequests(empReqs || []);
    } catch (err: any) {
      console.error('[RequestCenter] Error loading requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJoin = async (request: JoinRequest) => {
    setSelectedRequest({ ...request, type: 'join' });
    setShowApproveModal(true);
  };

  const confirmApproveJoin = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await teamJoinRequestsService.approveRequest(
        selectedRequest.id,
        selectedRequest.team_id,
        selectedRequest.user_id
      );

      await notificationsService.createNotification(
        selectedRequest.user_id,
        'Demande approuvée',
        `Votre demande d'adhésion à l'équipe ${selectedRequest.teams?.name} a été approuvée! ${approveComment ? `Message: ${approveComment}` : ''}`,
        'request_approved',
        selectedRequest.id
      );

      setSuccess('Demande d\'adhésion approuvée avec succès!');
      setShowApproveModal(false);
      setApproveComment('');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineJoin = async (request: JoinRequest) => {
    setSelectedRequest({ ...request, type: 'join' });
    setShowDeclineModal(true);
  };

  const confirmDeclineJoin = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await teamJoinRequestsService.rejectRequest(selectedRequest.id);

      await notificationsService.createNotification(
        selectedRequest.user_id,
        'Demande refusée',
        `Votre demande d'adhésion à l'équipe ${selectedRequest.teams?.name} a été refusée. ${declineComment || 'Aucune raison fournie.'}`,
        'request_rejected',
        selectedRequest.id
      );

      setSuccess('Demande refusée');
      setShowDeclineModal(false);
      setDeclineComment('');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Échec du refus');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveEmployeeRequest = async (request: EmployeeRequest) => {
    setSelectedRequest({ ...request, type: 'employee' });
    setShowApproveModal(true);
  };

  const confirmApproveEmployeeRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await employeeRequestsService.approveRequest(selectedRequest.id, approveComment);

      await notificationsService.createNotification(
        selectedRequest.user_id,
        'Demande approuvée',
        `Votre demande "${selectedRequest.title}" a été approuvée. ${approveComment || ''}`,
        'request_approved',
        selectedRequest.id
      );

      setSuccess('Demande approuvée avec succès!');
      setShowApproveModal(false);
      setApproveComment('');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'approbation');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineEmployeeRequest = async (request: EmployeeRequest) => {
    setSelectedRequest({ ...request, type: 'employee' });
    setShowDeclineModal(true);
  };

  const confirmDeclineEmployeeRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await employeeRequestsService.rejectRequest(selectedRequest.id, declineComment);

      await notificationsService.createNotification(
        selectedRequest.user_id,
        'Demande refusée',
        `Votre demande "${selectedRequest.title}" a été refusée. ${declineComment || 'Aucune raison fournie.'}`,
        'request_rejected',
        selectedRequest.id
      );

      setSuccess('Demande refusée');
      setShowDeclineModal(false);
      setDeclineComment('');
      await loadAllRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Échec du refus');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
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

  const filteredJoinRequests = joinRequests.filter((req) => {
    const matchesSearch = req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployeeRequests = employeeRequests.filter((req) => {
    const matchesSearch = req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingJoinCount = joinRequests.filter(r => r.status === 'pending').length;
  const pendingEmployeeCount = employeeRequests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Chargement du centre de requêtes...</span>
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
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
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

        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm font-medium text-amber-400 mb-4"
          >
            <Shield size={16} />
            Centre de Requêtes Manager
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">Boîte de Réception Centralisée</h1>
          <p className="text-slate-400 text-lg">Gérez toutes les demandes de votre équipe en un seul endroit</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-3xl font-bold text-white">{pendingJoinCount + pendingEmployeeCount}</span>
              </div>
              <p className="text-slate-400 text-sm">Demandes en Attente</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-3xl font-bold text-white">
                  {joinRequests.filter(r => r.status === 'approved').length + employeeRequests.filter(r => r.status === 'approved').length}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Demandes Approuvées</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-all"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-3xl font-bold text-white">{joinRequests.length + employeeRequests.length}</span>
              </div>
              <p className="text-slate-400 text-sm">Total Demandes</p>
            </div>
          </motion.div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('membership')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'membership'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-5 h-5" />
                Adhésions
                {pendingJoinCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-bold">
                    {pendingJoinCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-5 h-5" />
                Demandes Admin
                {pendingEmployeeCount > 0 && (
                  <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full font-bold">
                    {pendingEmployeeCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-480px)] overflow-y-auto pr-2 styled-scrollbar">
            {activeTab === 'membership' ? (
              filteredJoinRequests.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Aucune demande d'adhésion</p>
                  <p className="text-sm mt-2 text-slate-500">Les nouvelles demandes apparaîtront ici</p>
                </div>
              ) : (
                filteredJoinRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {request.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg mb-1">{request.profiles?.full_name}</h3>
                          <p className="text-slate-400 text-sm mb-3">{request.profiles?.email}</p>
                          {request.message && (
                            <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg mb-3">
                              <p className="text-slate-300 text-sm italic">"{request.message}"</p>
                            </div>
                          )}
                          <div className="text-slate-500 text-xs">
                            {new Date(request.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                        <button
                          onClick={() => handleDeclineJoin(request)}
                          className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                        <button
                          onClick={() => handleApproveJoin(request)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )
            ) : (
              filteredEmployeeRequests.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Aucune demande administrative</p>
                  <p className="text-sm mt-2 text-slate-500">Les nouvelles demandes apparaîtront ici</p>
                </div>
              ) : (
                filteredEmployeeRequests.map((request, index) => {
                  const TypeIcon = requestTypeIcons[request.type];
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-bold text-lg">{request.title}</h3>
                              <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                                {requestTypeLabels[request.type]}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">Par {request.profiles?.full_name}</p>
                            <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg mb-3">
                              <p className="text-slate-300 text-sm">{request.description}</p>
                            </div>
                            <div className="text-slate-500 text-xs">
                              {new Date(request.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                          <button
                            onClick={() => handleDeclineEmployeeRequest(request)}
                            className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </button>
                          <button
                            onClick={() => handleApproveEmployeeRequest(request)}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )
            )}
          </div>
        </div>

        <AnimatePresence>
          {(showDeclineModal || showApproveModal) && selectedRequest && (
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {showApproveModal ? 'Approuver la demande' : 'Refuser la demande'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {selectedRequest.type === 'join'
                      ? `Demande de ${selectedRequest.profiles?.full_name}`
                      : `Demande: ${selectedRequest.title}`}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    {showApproveModal ? 'Message de confirmation (optionnel)' : 'Raison du refus (optionnel)'}
                  </label>
                  <textarea
                    value={showApproveModal ? approveComment : declineComment}
                    onChange={(e) => showApproveModal ? setApproveComment(e.target.value) : setDeclineComment(e.target.value)}
                    placeholder={showApproveModal ? 'Ajoutez un message de bienvenue...' : 'Expliquez la raison du refus...'}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all min-h-[120px] resize-none"
                    disabled={processing}
                    maxLength={500}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      showApproveModal ? setShowApproveModal(false) : setShowDeclineModal(false);
                      setApproveComment('');
                      setDeclineComment('');
                    }}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white rounded-xl py-3 transition-all font-medium"
                    disabled={processing}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (showApproveModal) {
                        selectedRequest.type === 'join' ? confirmApproveJoin() : confirmApproveEmployeeRequest();
                      } else {
                        selectedRequest.type === 'join' ? confirmDeclineJoin() : confirmDeclineEmployeeRequest();
                      }
                    }}
                    className={`flex-1 rounded-xl py-3 transition-all font-semibold flex items-center justify-center gap-2 ${
                      showApproveModal
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20'
                    }`}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        {showApproveModal ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {showApproveModal ? 'Confirmer' : 'Refuser'}
                      </>
                    )}
                  </button>
                </div>
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
}
