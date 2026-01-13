import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Target, Lock, TrendingUp, Users, BarChart3, ArrowRight, Sparkles, CheckCircle2, Eye, Clock, Database } from 'lucide-react';
import { AnimatedCounter } from '../components/landing/AnimatedCounter';
import { ScrollProgress } from '../components/landing/ScrollProgress';
import { FloatingCTA } from '../components/landing/FloatingCTA';
import { ROICalculator } from '../components/landing/ROICalculator';
import { PricingSection } from '../components/landing/PricingSection';
import { DashboardMockup } from '../components/landing/DashboardMockup';
import { FAQAccordion } from '../components/landing/FAQAccordion';
import { LiveActivityFeed } from '../components/landing/LiveActivityFeed';
import { IntegrationShowcase } from '../components/landing/IntegrationShowcase';

export const LandingPage = () => {
  const navigate = useNavigate();
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: Zap,
      title: 'Détection Instantanée',
      description: 'Identifiez les blocages en temps réel avant qu\'ils n\'impactent vos équipes'
    },
    {
      icon: Target,
      title: 'Alignement OKR',
      description: 'Transformez vos objectifs stratégiques en actions concrètes et mesurables'
    },
    {
      icon: Shield,
      title: 'Éthique & Conformité',
      description: 'Respect total du RGPD et du droit à la déconnexion, par design'
    },
    {
      icon: TrendingUp,
      title: 'Impact Mesurable',
      description: 'Visualisez les gains de productivité et le ROI en temps réel'
    },
    {
      icon: Users,
      title: 'Vision 360°',
      description: 'Cartographie complète de la santé opérationnelle de vos équipes'
    },
    {
      icon: Eye,
      title: 'Zéro Surveillance',
      description: 'Analyse des métadonnées uniquement, jamais de contenus privés'
    }
  ];

  const stats = [
    { value: '87%', label: 'Réduction du temps perdu' },
    { value: '33+', label: 'Intégrations disponibles' },
    { value: '24/7', label: 'Monitoring intelligent' },
    { value: '100%', label: 'Conforme RGPD' }
  ];

  const process = [
    {
      icon: Database,
      title: 'Connexion',
      description: 'Branchez vos 33 outils favoris en un clic via API sécurisée.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Analyse',
      description: 'L\'IA croise les métadonnées pour identifier les frictions réelles, sans jamais lire vos contenus privés.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Target,
      title: 'Résolution',
      description: 'Débloquez vos équipes grâce à des rapports actionnables et une visibilité totale sur les OKR.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <ScrollProgress />
      <FloatingCTA />

      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none animate-gradient-shift" style={{
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite'
      }}></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRDMS43OSAzMCAwIDMxLjc5IDAgMzRzMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTMwYzAtMi4yMS0xLjc5LTQtNC00QzEuNzkgMCAwIDEuNzkgMCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              InsightFlow
            </span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/role-selection')}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            Se Connecter
          </motion.button>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm font-medium text-cyan-400 mb-8">
                <Sparkles size={16} />
                Intelligence Opérationnelle Nouvelle Génération
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              L'intelligence opérationnelle,{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                redéfinie.
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Détectez les blocages invisibles. Alignez vos équipes sur les OKR.
              Protégez le temps de travail. Le radar éthique pour les entreprises
              qui visent l'excellence.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => navigate('/role-selection')}
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 flex items-center gap-2"
              >
                Commencer l'analyse
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button
                onClick={() => navigate('/role-selection')}
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm"
              >
                Voir la démo
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <AnimatedCounter key={index} value={stat.value} label={stat.label} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Comment ça{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                fonctionne
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Trois étapes pour transformer votre efficacité opérationnelle
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {process.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600 transition-all duration-500 h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>

                    <div className={`relative w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={28} />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>

                    <div className="absolute top-4 right-4 w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600">
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Organisez par{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                équipes
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
              Créez des équipes distinctes pour chaque secteur de votre organisation. Chaque équipe dispose de son propre tableau de bord, ses intégrations et ses métriques personnalisées.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { name: 'Finance', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', tools: 'Excel, SAP, QuickBooks' },
              { name: 'Marketing', icon: Target, color: 'from-pink-500 to-rose-600', tools: 'HubSpot, Mailchimp, Analytics' },
              { name: 'Développement', icon: Database, color: 'from-blue-500 to-cyan-600', tools: 'GitHub, Jira, Slack' },
              { name: 'Ressources Humaines', icon: Users, color: 'from-purple-500 to-indigo-600', tools: 'BambooHR, Workday, Teams' },
            ].map((team, index) => {
              const Icon = team.icon;
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${team.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{team.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{team.tools}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Conçu pour{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                l'excellence
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Des fonctionnalités pensées pour maximiser votre impact sans compromis sur l'éthique
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-cyan-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <DashboardMockup />

      <IntegrationShowcase />

      <LiveActivityFeed />

      <ROICalculator />

      <PricingSection />

      <section className="relative py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-xl rounded-3xl p-12 border border-emerald-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Shield className="text-white" size={48} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Éthique par design
                </h3>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Respect total du RGPD et du droit à la déconnexion.
                  Nous analysons uniquement les métadonnées, jamais vos contenus privés.
                  Votre confiance est notre priorité absolue.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">Conforme RGPD</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Lock size={20} />
                    <span className="font-medium">Chiffrement E2E</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Clock size={20} />
                    <span className="font-medium">Droit à la déconnexion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <FAQAccordion />

      <section className="relative py-32 px-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Prêt à transformer{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                votre efficacité ?
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-12">
              Rejoignez les entreprises qui ont choisi l'excellence opérationnelle éthique
            </p>
            <button
              onClick={() => navigate('/role-selection')}
              className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 flex items-center gap-2 mx-auto"
            >
              Commencer gratuitement
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="relative border-t border-slate-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                InsightFlow
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
            </div>

            <div className="text-sm text-slate-500">
              © 2024 InsightFlow. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
