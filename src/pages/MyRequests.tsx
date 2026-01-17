import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  Headphones,
  MoreHorizontal,
  Trash2,
  Edit,
  X,
} from 'lucide-react';
import { employeeRequestsService, EmployeeRequest, CreateRequestData } from '../services/employeeRequestsService';

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

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const statusColors = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  approved: 'text-green-400 bg-green-500/10 border-green-500/30',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export const MyRequests = () => {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<EmployeeRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await employeeRequestsService.getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (data: CreateRequestData) => {
    try {
      await employeeRequestsService.createRequest(data);
      await loadRequests();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleUpdateRequest = async (id: string, data: Partial<CreateRequestData>) => {
    try {
      await employeeRequestsService.updateRequest(id, data);
      await loadRequests();
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;

    try {
      await employeeRequestsService.deleteRequest(id);
      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mes Demandes</h1>
          <p className="text-slate-400">Gérez vos demandes auprès de votre manager</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Demande
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-slate-400">En attente</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Approuvées</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Refusées</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => {
          const StatusIcon = statusIcons[request.status];
          const TypeIcon = requestTypeIcons[request.type];

          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <p className="text-sm text-slate-400">{requestTypeLabels[request.type]}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColors[request.status]}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusLabels[request.status]}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-3 line-clamp-2">{request.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className={`px-2 py-1 rounded ${priorityColors[request.priority]}`}>
                      {priorityLabels[request.priority]}
                    </div>
                    <span className="text-slate-400">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRequest(request);
                      }}
                      className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(request.id);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {requests.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune demande pour le moment</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Créer votre première demande
            </button>
          </div>
        )}
      </div>

      {(showCreateModal || editingRequest) && (
        <RequestModal
          request={editingRequest}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRequest(null);
          }}
          onSubmit={editingRequest
            ? (data) => handleUpdateRequest(editingRequest.id, data)
            : handleCreateRequest
          }
        />
      )}

      {selectedRequest && !editingRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onEdit={() => {
            setEditingRequest(selectedRequest);
            setSelectedRequest(null);
          }}
          onDelete={handleDeleteRequest}
        />
      )}
    </div>
  );
};

function RequestModal({
  request,
  onClose,
  onSubmit,
}: {
  request?: EmployeeRequest | null;
  onClose: () => void;
  onSubmit: (data: CreateRequestData) => void;
}) {
  const [formData, setFormData] = useState<CreateRequestData>({
    type: request?.type || 'other',
    title: request?.title || '',
    description: request?.description || '',
    priority: request?.priority || 'normal',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {request ? 'Modifier la demande' : 'Nouvelle demande'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Type de demande
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            >
              <option value="time_off">Congé</option>
              <option value="resource">Ressource</option>
              <option value="equipment">Équipement</option>
              <option value="support">Support</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="low">Faible</option>
              <option value="normal">Normal</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
              placeholder="Ex: Demande de congé pour formation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[120px]"
              placeholder="Décrivez votre demande en détail..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              {request ? 'Mettre à jour' : 'Créer la demande'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RequestDetailModal({
  request,
  onClose,
  onEdit,
  onDelete,
}: {
  request: EmployeeRequest;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = statusIcons[request.status];
  const TypeIcon = requestTypeIcons[request.type];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{request.title}</h2>
              <p className="text-slate-400">{requestTypeLabels[request.type]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border w-fit ${statusColors[request.status]}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{statusLabels[request.status]}</span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
            <p className="text-white">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Priorité</h3>
              <div className={`px-3 py-1 rounded w-fit ${priorityColors[request.priority]}`}>
                {priorityLabels[request.priority]}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Date de création</h3>
              <p className="text-white">{new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {request.manager_response && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Réponse du manager</h3>
              <p className="text-white">{request.manager_response}</p>
              {request.resolved_at && (
                <p className="text-sm text-slate-500 mt-2">
                  {new Date(request.resolved_at).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(request.resolved_at).toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
          )}
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-800">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={() => {
                onDelete(request.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
