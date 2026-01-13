import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, ArrowRight, Sparkles, Shield, Target, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const RoleSelection = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'member' | null>(null);

  const handleRoleSelection = (role: 'manager' | 'member') => {
    sessionStorage.setItem('selectedRole', role);
    navigate('/login');
  };

  const roles = [
    {
      id: 'manager',
      title: 'Manager',
      description: 'Créez et gérez des équipes, invitez des membres, suivez les performances',
      icon: Crown,
      gradient: 'from-amber-500 to-orange-600',
      features: [
        'Créer des équipes',
        'Inviter des membres',
        'Gérer les permissions',
        'Analyser les performances',
      ],
    },
    {
      id: 'member',
      title: 'Employé',
      description: 'Rejoignez des équipes, collaborez avec vos collègues, suivez vos objectifs',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      features: [
        'Rejoindre des équipes',
        'Voir les objectifs',
        'Collaborer efficacement',
        'Suivre les progrès',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm font-medium text-cyan-400 mb-6">
            <Sparkles size={16} />
            Bienvenue sur InsightFlow
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Choisissez votre rôle
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Sélectionnez le rôle qui correspond le mieux à vos responsabilités
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedRole(role.id as 'manager' | 'member')}
              className={`
                relative group cursor-pointer
                bg-slate-900/50 backdrop-blur-sm border-2 rounded-2xl p-8
                transition-all duration-300 hover:scale-[1.02]
                ${
                  selectedRole === role.id
                    ? `border-${role.gradient.split('-')[1]}-500 shadow-2xl shadow-${role.gradient.split('-')[1]}-500/20`
                    : 'border-slate-800 hover:border-slate-700'
                }
              `}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-full blur-3xl`} />
              </div>

              <div className="relative">
                <div
                  className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                  bg-gradient-to-br ${role.gradient}
                  shadow-lg group-hover:shadow-2xl transition-all
                `}
                >
                  <role.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
                <p className="text-slate-400 mb-6">{role.description}</p>

                <div className="space-y-3 mb-6">
                  {role.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.gradient}`} />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelection(role.id as 'manager' | 'member');
                  }}
                  disabled={loading}
                  className={`
                    w-full py-3 rounded-xl font-semibold
                    flex items-center justify-center gap-2
                    transition-all duration-300 disabled:opacity-50
                    ${
                      selectedRole === role.id
                        ? `bg-gradient-to-r ${role.gradient} text-white shadow-lg`
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  {loading ? (
                    'Chargement...'
                  ) : (
                    <>
                      Choisir ce rôle
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {selectedRole === role.id && (
                <motion.div
                  layoutId="selected-indicator"
                  className="absolute -top-3 -right-3"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-xl`}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            Vous pourrez toujours modifier votre rôle plus tard dans les paramètres
          </p>
        </motion.div>
      </div>
    </div>
  );
};
