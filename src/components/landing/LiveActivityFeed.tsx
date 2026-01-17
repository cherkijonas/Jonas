import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface Activity {
  id: number;
  type: 'success' | 'warning' | 'improvement' | 'team';
  message: string;
  time: string;
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const activityPool: Omit<Activity, 'id' | 'time'>[] = [
    { type: 'success', message: 'Sarah vient de résoudre un blocage Slack' },
    { type: 'improvement', message: 'Équipe Marketing a réduit de 2h son temps de réunion' },
    { type: 'success', message: 'Thomas a débloquer 3 tickets Jira' },
    { type: 'team', message: 'Équipe Dev a atteint 95% de vélocité' },
    { type: 'warning', message: 'Nouveau canal Discord inactif détecté' },
    { type: 'success', message: 'Marie a résolu une issue GitHub critique' },
    { type: 'improvement', message: 'Équipe Product a amélioré son OKR de 18%' },
    { type: 'team', message: 'Équipe Design collabore 40% plus efficacement' },
    { type: 'success', message: 'Lucas a clôturé 5 PRs en attente' },
    { type: 'improvement', message: 'Temps de réponse Slack réduit de 30%' }
  ];

  useEffect(() => {
    const addActivity = () => {
      const randomActivity = activityPool[Math.floor(Math.random() * activityPool.length)];
      const newActivity: Activity = {
        ...randomActivity,
        id: Date.now(),
        time: 'À l\'instant'
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);
    };

    addActivity();
    addActivity();

    const interval = setInterval(addActivity, 3500);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'warning':
        return AlertTriangle;
      case 'improvement':
        return TrendingUp;
      case 'team':
        return Users;
    }
  };

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'from-emerald-500 to-teal-600';
      case 'warning':
        return 'from-orange-500 to-red-600';
      case 'improvement':
        return 'from-cyan-500 to-blue-600';
      case 'team':
        return 'from-purple-500 to-pink-600';
    }
  };

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-sm font-medium text-red-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            En direct
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Activité{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              en temps réel
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Des équipes du monde entier améliorent leur efficacité chaque seconde
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none"></div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="space-y-3 h-[400px] overflow-hidden">
              <AnimatePresence mode="popLayout">
                {activities.map((activity) => {
                  const Icon = getIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ x: -50, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: 50, opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${getColor(activity.type)} rounded-lg flex items-center justify-center`}>
                        <Icon className="text-white" size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{activity.message}</p>
                        <p className="text-slate-500 text-xs">{activity.time}</p>
                      </div>

                      <div className="flex-shrink-0">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        ></motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">2,847</div>
                <div className="text-xs text-slate-500">Blocages résolus aujourd'hui</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">1,234</div>
                <div className="text-xs text-slate-500">Équipes actives</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">98.7%</div>
                <div className="text-xs text-slate-500">Satisfaction moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
