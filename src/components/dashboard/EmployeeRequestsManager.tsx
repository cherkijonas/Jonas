import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  Headphones,
  MoreHorizontal,
  MessageSquare,
  X,
} from 'lucide-react';
import { employeeRequestsService, EmployeeRequest } from '../../services/employeeRequestsService';

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

const priorityColors = {
  low: 'text-slate-400 bg-slate-500/10',
  normal: 'text-blue-400 bg-blue-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  urgent: 'text-red-400 bg-red-500/10',
};

const priorityLabels = {
  low: 'Faible',
  normal: 'Normal',
  high: 'Élevée',
  urgent: 'Urgent',
};

export const EmployeeRequestsManager = () => {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAction, setResponseAction] = useState<'approved' | 'rejected'>('approved');
  const [responseMessage, setResponseMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await employeeRequestsService.getTeamRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, status: 'approved' | 'rejected', message?: string) => {
    try {
      setProcessingId(requestId);
      await employeeRequestsService.updateRequestStatus(requestId, status, undefined, message);
      await loadRequests();
      setShowResponseModal(false);
      setSelectedRequest(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const openResponseModal = (request: EmployeeRequest, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setShowResponseModal(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Demandes des Employés</h2>
        <p className="text-slate-400">Gérez les demandes de votre équipe</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filter === 'pending'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          En attente ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filter === 'approved'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Approuvées ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filter === 'rejected'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Refusées ({rejectedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          }`}
        >
          Toutes ({requests.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request) => {
          const TypeIcon = requestTypeIcons[request.type];
          const isProcessing = processingId === request.id;

          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TypeIcon className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{request.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="font-medium">{request.employee_name}</span>
                        <span>•</span>
                        <span>{requestTypeLabels[request.type]}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded ${priorityColors[request.priority]} flex-shrink-0`}>
                      {priorityLabels[request.priority]}
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{request.description}</p>

                  {request.manager_response && (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-400">Votre réponse</span>
                      </div>
                      <p className="text-white text-sm">{request.manager_response}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openResponseModal(request, 'approved')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => openResponseModal(request, 'rejected')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Approuvée</span>
                      {request.resolved_at && (
                        <span className="text-sm text-slate-400">
                          • {new Date(request.resolved_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Refusée</span>
                      {request.resolved_at && (
                        <span className="text-sm text-slate-400">
                          • {new Date(request.resolved_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {filter === 'pending'
                ? 'Aucune demande en attente'
                : filter === 'all'
                ? 'Aucune demande pour le moment'
                : `Aucune demande ${filter === 'approved' ? 'approuvée' : 'refusée'}`}
            </p>
          </div>
        )}
      </div>

      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {responseAction === 'approved' ? 'Approuver la demande' : 'Refuser la demande'}
              </h3>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                }}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-300 mb-2">
                <strong>{selectedRequest.employee_name}</strong> - {selectedRequest.title}
              </p>
              <p className="text-slate-400 text-sm">{selectedRequest.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Ajoutez un message pour l'employé..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage('');
                }}
                className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleResponse(selectedRequest.id, responseAction, responseMessage || undefined)}
                disabled={processingId !== null}
                className={`flex-1 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  responseAction === 'approved'
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {processingId ? 'Traitement...' : responseAction === 'approved' ? 'Approuver' : 'Refuser'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
