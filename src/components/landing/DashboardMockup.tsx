import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

export const DashboardMockup = () => {
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
            Une interface{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              intuitive
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Visualisez l'essentiel en un coup d'œil
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto"
          style={{ perspective: '2000px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 blur-3xl opacity-20"></div>

          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center text-sm text-slate-500">InsightFlow Dashboard</div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl p-4 border border-emerald-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-emerald-400" size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-xs text-slate-400">Santé globale</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="text-red-400" size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-xs text-slate-400">Alertes critiques</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="text-cyan-400" size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">28</div>
                  <div className="text-xs text-slate-400">Issues résolues</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="text-purple-400" size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+12%</div>
                  <div className="text-xs text-slate-400">Vélocité équipe</div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-slate-900/50 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Issues Critiques</h3>
                  <span className="text-xs text-slate-400">Temps réel</span>
                </div>

                <div className="space-y-3">
                  {[
                    { tool: 'Slack', issue: 'Canal #design inactif depuis 7 jours', severity: 'high' },
                    { tool: 'Jira', issue: '12 tickets bloqués > 5 jours', severity: 'high' },
                    { tool: 'GitHub', issue: 'PR ouverte depuis 14 jours', severity: 'medium' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.7 + idx * 0.1 }}
                      className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3"
                    >
                      <div className={`w-2 h-2 rounded-full ${item.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'} animate-pulse`}></div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-500">{item.tool}</div>
                        <div className="text-sm text-white">{item.issue}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 }}
                className="relative h-32 bg-slate-900/50 rounded-xl p-4 border border-slate-700 overflow-hidden"
              >
                <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                  {[65, 82, 78, 90, 85, 88, 92, 87].map((height, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 1.2 + idx * 0.1, ease: 'easeOut' }}
                      className="w-8 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                    ></motion.div>
                  ))}
                </div>
                <div className="relative text-xs text-slate-400">Vélocité des 7 derniers jours</div>
              </motion.div>
            </div>
          </div>

          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-50"
          ></motion.div>

          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-2xl opacity-50"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};
