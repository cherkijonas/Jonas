import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  FileText,
  CheckCircle2,
  MessageSquare,
  Target,
  Link as LinkIcon,
  Clock,
} from 'lucide-react';
import { employeeActivityService } from '../../services/employeeActivityService';

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

interface ActivityTimelineProps {
  userId: string;
  limit?: number;
}

export const ActivityTimeline = ({ userId, limit = 10 }: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const data = await employeeActivityService.getRecentActivities(userId, limit);
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'integration_connected':
        return { Icon: LinkIcon, color: 'cyan', gradient: 'from-cyan-500 to-blue-600' };
      case 'request_submitted':
        return { Icon: FileText, color: 'violet', gradient: 'from-violet-500 to-purple-600' };
      case 'request_approved':
        return { Icon: CheckCircle2, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' };
      case 'goal_created':
        return { Icon: Target, color: 'amber', gradient: 'from-amber-500 to-orange-600' };
      case 'feedback_submitted':
        return { Icon: MessageSquare, color: 'blue', gradient: 'from-blue-500 to-indigo-600' };
      default:
        return { Icon: Activity, color: 'slate', gradient: 'from-slate-500 to-slate-600' };
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'integration_connected':
        return 'Outil Connecté';
      case 'request_submitted':
        return 'Demande Soumise';
      case 'request_approved':
        return 'Demande Approuvée';
      case 'goal_created':
        return 'Objectif Créé';
      case 'feedback_submitted':
        return 'Feedback Envoyé';
      default:
        return 'Activité';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Activité Récente</h2>
          <p className="text-sm text-slate-400">{activities.length} activités</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">Aucune activité récente</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const { Icon, color, gradient } = getActivityIcon(activity.activity_type);
            const label = getActivityLabel(activity.activity_type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all group"
              >
                <div
                  className={`p-2 bg-gradient-to-br ${gradient} bg-opacity-20 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs font-semibold text-${color}-400`}>{label}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(activity.created_at)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{activity.description}</p>

                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.metadata.tool_name && (
                        <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                          {activity.metadata.tool_name}
                        </span>
                      )}
                      {activity.metadata.category && (
                        <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                          {activity.metadata.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {activities.length > 0 && activities.length >= limit && (
        <button className="w-full mt-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          Voir toute l'activité
        </button>
      )}
    </div>
  );
};
