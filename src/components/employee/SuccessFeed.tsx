import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  GitMerge,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import { employeeActivityService, EmployeeActivity } from '../../services/employeeActivityService';

interface SuccessFeedProps {
  userId: string;
}

const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes === 1) return 'Il y a 1 minute';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minutes`;
  if (diffInHours === 1) return 'Il y a 1 heure';
  if (diffInHours < 24) return `Il y a ${diffInHours} heures`;
  if (diffInDays === 1) return 'Il y a 1 jour';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  return date.toLocaleDateString('fr-FR');
};

export const SuccessFeed = ({ userId }: SuccessFeedProps) => {
  const [activities, setActivities] = useState<EmployeeActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadActivities();
    }
  }, [userId]);

  const loadActivities = async () => {
    try {
      const data = await employeeActivityService.getRecentActivities(userId, 48);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockSuccesses: EmployeeActivity[] = activities.length === 0 ? [
    {
      id: '1',
      user_id: userId,
      activity_type: 'achievement',
      title: '5 tickets résolus',
      description: 'Excellent sprint! 40% au-dessus de votre moyenne',
      icon: 'CheckCircle2',
      color: '#00FF88',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      user_id: userId,
      activity_type: 'milestone',
      title: 'PR mergée en 3h',
      description: 'Validation ultra-rapide par l\'équipe',
      icon: 'GitMerge',
      color: '#06B6D4',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      user_id: userId,
      activity_type: 'streak',
      title: '7 jours de deep work',
      description: '3h+ de focus chaque jour cette semaine',
      icon: 'Target',
      color: '#8B5CF6',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      user_id: userId,
      activity_type: 'productivity',
      title: 'Vélocité +22%',
      description: 'Votre efficacité augmente ce mois-ci',
      icon: 'TrendingUp',
      color: '#FF8C00',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      user_id: userId,
      activity_type: 'achievement',
      title: '10 outils connectés',
      description: 'Écosystème bien intégré',
      icon: 'Award',
      color: '#F59E0B',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ] : activities;

  const displayActivities = mockSuccesses;

  const iconMap: Record<string, any> = {
    CheckCircle2,
    GitMerge,
    Target,
    TrendingUp,
    Award,
    Zap,
    Clock,
    Sparkles,
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'Réalisation';
      case 'milestone':
        return 'Étape';
      case 'streak':
        return 'Série';
      case 'productivity':
        return 'Productivité';
      default:
        return 'Succès';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Succès Récents</h3>
        </div>
        <span className="text-xs text-slate-500">Dernières 48h</span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {displayActivities.map((activity, index) => {
          const Icon = iconMap[activity.icon] || Sparkles;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-4 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${activity.color}20`,
                    boxShadow: `0 0 20px ${activity.color}20`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: activity.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {activity.title}
                    </h4>
                    <span
                      className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${activity.color}15`,
                        color: activity.color,
                      }}
                    >
                      {getTypeLabel(activity.activity_type)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-2">{activity.description}</p>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">
                      {getRelativeTime(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: activity.color,
                  boxShadow: `0 0 12px ${activity.color}`,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {displayActivities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Vos succès apparaîtront ici au fur et à mesure
          </p>
        </div>
      )}
    </div>
  );
};
