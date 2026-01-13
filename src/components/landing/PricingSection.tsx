import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

export const PricingSection = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: 'Starter',
      icon: Sparkles,
      description: 'Pour les petites équipes qui démarrent',
      badge: null,
      color: 'from-slate-600 to-slate-700',
      borderColor: 'border-slate-700',
      features: [
        'Jusqu\'à 10 employés',
        '5 intégrations',
        'Dashboard basique',
        'Support email',
        'Rapports mensuels'
      ]
    },
    {
      name: 'Pro',
      icon: Zap,
      description: 'Pour les équipes en croissance',
      badge: 'Populaire',
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500',
      features: [
        'Jusqu\'à 100 employés',
        '20 intégrations',
        'Dashboard avancé',
        'Support prioritaire 24/7',
        'Rapports en temps réel',
        'Alertes personnalisées',
        'API complète'
      ]
    },
    {
      name: 'Enterprise',
      icon: Crown,
      description: 'Pour les grandes organisations',
      badge: null,
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500',
      features: [
        'Employés illimités',
        'Toutes les intégrations (33+)',
        'Dashboard personnalisable',
        'Support dédié & formation',
        'Analyses prédictives IA',
        'Conformité sur mesure',
        'SSO & sécurité avancée',
        'SLA garanti 99.9%'
      ]
    }
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Un plan pour{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              chaque ambition
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Commencez gratuitement et évoluez à votre rythme
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPro = plan.badge === 'Populaire';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${isPro ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-bold text-white shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border ${isPro ? 'border-cyan-500/50 shadow-xl shadow-cyan-500/20' : plan.borderColor + '/50'} transition-all duration-300 hover:scale-105 h-full flex flex-col`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="text-white" size={28} />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-8">{plan.description}</p>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`flex-shrink-0 mt-0.5 ${isPro ? 'text-cyan-400' : 'text-slate-400'}`} size={20} />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isPro
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    Commencer
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
