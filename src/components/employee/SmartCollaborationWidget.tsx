import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Calendar, Clock } from 'lucide-react';
import { collaborationService, CollaborationStatus } from '../../services/collaborationService';

export const SmartCollaborationWidget: React.FC = () => {
  const [teamStatuses, setTeamStatuses] = useState<any[]>([]);
  const [myStatus, setMyStatus] = useState<CollaborationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statuses, status] = await Promise.all([
        collaborationService.getTeamStatuses(),
        collaborationService.getMyStatus(),
      ]);
      setTeamStatuses(statuses);
      setMyStatus(status);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CollaborationStatus['status']) => {
    try {
      await collaborationService.updateStatus({ status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: CollaborationStatus['status']) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500';
      case 'focus':
        return 'bg-blue-500';
      case 'busy':
        return 'bg-amber-500';
      case 'meeting':
        return 'bg-purple-500';
      case 'away':
        return 'bg-slate-400';
      default:
        return 'bg-slate-300';
    }
  };

  const getStatusText = (status: CollaborationStatus['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'focus':
        return 'En focus';
      case 'busy':
        return 'Occupé';
      case 'meeting':
        return 'En réunion';
      case 'away':
        return 'Absent';
      default:
        return 'Inconnu';
    }
  };

  const statusOptions: CollaborationStatus['status'][] = ['available', 'focus', 'busy', 'meeting', 'away'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users size={20} className="text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">Smart Collaboration</h3>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Mon statut</h4>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                myStatus?.status === status
                  ? 'bg-white shadow-sm ring-2 ring-blue-500 text-slate-900'
                  : 'bg-white/50 text-slate-600 hover:bg-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
              {getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Équipe ({teamStatuses.length})</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {teamStatuses.length === 0 ? (
            <div className="text-center py-6">
              <Users size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucun membre d'équipe en ligne</p>
            </div>
          ) : (
            teamStatuses.map((member: any) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">
                      {member.profiles?.full_name || 'Unknown'}
                    </p>
                    <span className="text-xs text-slate-500">{getStatusText(member.status)}</span>
                  </div>
                  {member.current_task && (
                    <p className="text-xs text-slate-500 truncate">
                      <Clock size={10} className="inline mr-1" />
                      {member.current_task}
                    </p>
                  )}
                  {member.context_message && (
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {member.context_message}
                    </p>
                  )}
                </div>

                {member.available_for_help && member.status !== 'focus' && member.status !== 'meeting' && (
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0">
                    <MessageCircle size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Calendar size={16} />
          Meilleur moment pour se réunir
        </button>
      </div>
    </div>
  );
};
