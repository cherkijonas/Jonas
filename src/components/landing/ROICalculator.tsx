import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Euro } from 'lucide-react';

export const ROICalculator = () => {
  const [employees, setEmployees] = useState(50);

  const hoursLostPerEmployee = 8;
  const averageHourlyRate = 45;
  const reductionRate = 0.87;

  const totalHoursLost = employees * hoursLostPerEmployee;
  const hoursSaved = totalHoursLost * reductionRate;
  const monthlySavings = Math.round(hoursSaved * averageHourlyRate);
  const yearlySavings = monthlySavings * 12;

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Calculez votre{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ROI
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Découvrez combien vous pourriez économiser avec InsightFlow
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-700/50"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Nombre d'employés dans votre entreprise
              </label>

              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/50"
                />
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <Users className="text-cyan-400" size={24} />
                  <span className="text-4xl font-bold text-white">{employees}</span>
                  <span className="text-slate-400">employés</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Heures perdues par employé/mois</span>
                  <span className="text-white font-semibold">{hoursLostPerEmployee}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Taux horaire moyen</span>
                  <span className="text-white font-semibold">{averageHourlyRate}€</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Réduction avec InsightFlow</span>
                  <span className="text-emerald-400 font-semibold">{reductionRate * 100}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <motion.div
                  key={monthlySavings}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 border border-emerald-500/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Euro className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Économies mensuelles</div>
                      <div className="text-3xl font-bold text-white">
                        {monthlySavings.toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  key={yearlySavings}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Économies annuelles</div>
                      <div className="text-3xl font-bold text-white">
                        {yearlySavings.toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  key={hoursSaved}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Heures récupérées/mois</div>
                      <div className="text-3xl font-bold text-white">
                        {Math.round(hoursSaved)}h
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
