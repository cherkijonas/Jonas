import { motion } from 'framer-motion';
import {
  FileText,
  Zap,
  Users,
  Settings,
  MessageSquare,
  Calendar,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeQuickActionsProps {
  hasTeam: boolean;
  pendingRequestsCount?: number;
}

export const EmployeeQuickActions = ({
  hasTeam,
  pendingRequestsCount = 0,
}: EmployeeQuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nouvelle Demande',
      description: 'Soumettre une requête',
      icon: FileText,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600',
      onClick: () => navigate('/app/my-requests'),
    },
    {
      label: 'Connexions',
      description: 'Gérer vos outils',
      icon: Zap,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      onClick: () => navigate('/app/connections'),
    },
    {
      label: 'Mon Équipe',
      description: hasTeam ? 'Voir l\'équipe' : 'Rejoindre une équipe',
      icon: Users,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      onClick: () => navigate('/app/my-team'),
      badge: !hasTeam ? '!' : null,
    },
    {
      label: 'Paramètres',
      description: 'Votre profil',
      icon: Settings,
      color: 'slate',
      gradient: 'from-slate-500 to-slate-600',
      onClick: () => navigate('/app/settings'),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Actions Rapides</h2>
        <p className="text-sm text-slate-400">Accès direct aux fonctionnalités</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className="relative p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all text-left group"
            >
              {action.badge && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{action.badge}</span>
                </div>
              )}

              <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="font-semibold text-white text-sm mb-1">{action.label}</h3>
              <p className="text-xs text-slate-400">{action.description}</p>
            </motion.button>
          );
        })}
      </div>

      {pendingRequestsCount > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">
              Vous avez <span className="font-semibold text-cyan-400">{pendingRequestsCount}</span> demande(s) en attente
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
