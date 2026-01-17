import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Calendar, FileText, TrendingUp, Github, DollarSign, Users, Phone, Video, Code, Database, Cloud, Slack } from 'lucide-react';

interface Integration {
  name: string;
  icon: any;
  color: string;
  description: string;
  category: string;
}

export const IntegrationShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const integrations: Integration[] = [
    { name: 'Slack', icon: MessageSquare, color: 'from-purple-500 to-purple-600', description: 'Détecte les canaux zombies', category: 'Communication' },
    { name: 'Gmail', icon: Mail, color: 'from-red-500 to-red-600', description: 'Analyse les temps de réponse', category: 'Email' },
    { name: 'Google Calendar', icon: Calendar, color: 'from-blue-500 to-blue-600', description: 'Optimise les réunions', category: 'Productivité' },
    { name: 'Jira', icon: FileText, color: 'from-blue-600 to-blue-700', description: 'Suit les tickets bloqués', category: 'Gestion projet' },
    { name: 'GitHub', icon: Github, color: 'from-slate-700 to-slate-800', description: 'Monitor les PRs en attente', category: 'Dev' },
    { name: 'Asana', icon: TrendingUp, color: 'from-pink-500 to-pink-600', description: 'Track les deadlines', category: 'Gestion projet' },
    { name: 'Salesforce', icon: DollarSign, color: 'from-cyan-500 to-cyan-600', description: 'Analyse le pipeline', category: 'CRM' },
    { name: 'Teams', icon: Users, color: 'from-blue-500 to-blue-600', description: 'Mesure la collaboration', category: 'Communication' },
    { name: 'Zoom', icon: Video, color: 'from-blue-400 to-blue-500', description: 'Évalue les licences', category: 'Visio' },
    { name: 'Notion', icon: FileText, color: 'from-slate-800 to-slate-900', description: 'Suit les docs inactifs', category: 'Documentation' },
    { name: 'Linear', icon: Code, color: 'from-purple-600 to-purple-700', description: 'Vélocité dev', category: 'Gestion projet' },
    { name: 'AWS', icon: Cloud, color: 'from-orange-500 to-orange-600', description: 'Coûts & usage', category: 'Cloud' },
    { name: 'Discord', icon: Phone, color: 'from-indigo-500 to-indigo-600', description: 'Canaux vocaux actifs', category: 'Communication' },
    { name: 'PostgreSQL', icon: Database, color: 'from-blue-700 to-blue-800', description: 'Performance queries', category: 'Base de données' },
    { name: 'Trello', icon: TrendingUp, color: 'from-blue-500 to-blue-600', description: 'Cartes bloquées', category: 'Gestion projet' },
    { name: 'Figma', icon: Code, color: 'from-purple-500 to-pink-500', description: 'Collab design', category: 'Design' }
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-purple-900/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              33+ intégrations
            </span>{' '}
            natives
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Connectez tous vos outils favoris en un clic. Configuration instantanée via API sécurisée.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                <div className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 ${hoveredIndex === index ? 'shadow-xl shadow-cyan-500/20' : ''} cursor-pointer h-full flex flex-col items-center justify-center`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${integration.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>

                  <h3 className="text-sm font-bold text-white text-center mb-1">{integration.name}</h3>
                  <p className="text-xs text-slate-500 text-center">{integration.category}</p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0, y: hoveredIndex === index ? 0 : 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/50 flex items-center justify-center pointer-events-none"
                    style={{ display: hoveredIndex === index ? 'flex' : 'none' }}
                  >
                    <p className="text-xs text-cyan-400 text-center font-medium">{integration.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 mb-4">Et bien plus encore...</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Dropbox', 'Stripe', 'HubSpot', 'Zendesk', 'Intercom', 'GitLab', 'Vercel', 'Datadog'].map((name, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.6 + idx * 0.05 }}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-400"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
