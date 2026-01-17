import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmployeeMetricsWidget } from '../components/employee/EmployeeMetricsWidget';
import { EmployeeGoalsWidget } from '../components/employee/EmployeeGoalsWidget';
import { EmployeeQuickActions } from '../components/employee/EmployeeQuickActions';
import { employeeRequestsService } from '../services/employeeRequestsService';
import { employeeFeedbackService } from '../services/employeeFeedbackService';
import { integrationsService } from '../services/integrationsService';
import { teamsService } from '../services/teamsService';

export const EmployeeDashboard = () => {
  const { user, profile } = useAuth();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [unreadFeedback, setUnreadFeedback] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    try {
      const [requests, feedback, userIntegrations] = await Promise.all([
        employeeRequestsService.getMyRequests(user!.id),
        employeeFeedbackService.getUnreadFeedback(user!.id),
        integrationsService.getIntegrations(null, user!.id),
      ]);

      setRecentRequests((requests || []).slice(0, 5));
      setUnreadFeedback(feedback || []);
      setIntegrations(userIntegrations || []);

      if (profile?.assigned_team_id) {
        const teamData = await teamsService.getTeamById(profile.assigned_team_id);
        setTeam(teamData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-800/30 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-800/30 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequestsCount = recentRequests.filter(r => r.status === 'pending').length;
  const connectedToolsCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bonjour, {profile?.full_name?.split(' ')[0] || 'Employé'}
            </h1>
            <p className="text-slate-400">Voici un aperçu de votre activité</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadFeedback.length > 0 && (
              <div className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-400">
                    {unreadFeedback.length} nouveau{unreadFeedback.length > 1 ? 'x' : ''} feedback
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm text-slate-400">Demandes en attente</span>
            </div>
            <span className="text-3xl font-bold text-white">{pendingRequestsCount}</span>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-slate-400">Outils connectés</span>
            </div>
            <span className="text-3xl font-bold text-white">{connectedToolsCount}</span>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Équipe</span>
            </div>
            <span className="text-xl font-bold text-white">{team ? team.name : 'Aucune'}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EmployeeQuickActions
            hasTeam={!!profile?.assigned_team_id}
            pendingRequestsCount={pendingRequestsCount}
          />
        </div>

        <div className="lg:col-span-1">
          <EmployeeMetricsWidget userId={user!.id} />
        </div>

        <div className="lg:col-span-1">
          <EmployeeGoalsWidget userId={user!.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
                <Bell className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Demandes Récentes</h2>
                <p className="text-sm text-slate-400">{recentRequests.length} dernières</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Aucune demande récente</p>
              </div>
            ) : (
              recentRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{request.title}</h3>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="capitalize">{request.type.replace('_', ' ')}</span>
                    <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Feedback Récent</h2>
                <p className="text-sm text-slate-400">
                  {unreadFeedback.length} non lu{unreadFeedback.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {unreadFeedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Aucun nouveau feedback</p>
              </div>
            ) : (
              unreadFeedback.slice(0, 5).map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {feedback.from_profile?.full_name?.charAt(0) || 'M'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">
                          {feedback.from_profile?.full_name || 'Manager'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(feedback.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {feedback.feedback_text}
                      </p>
                      {feedback.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < feedback.rating
                                  ? 'bg-amber-400'
                                  : 'bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
