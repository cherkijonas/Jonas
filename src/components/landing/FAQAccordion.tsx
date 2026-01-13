import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Comment protégez-vous nos données ?',
      answer: 'Nous appliquons un chiffrement de bout en bout (E2E) et analysons uniquement les métadonnées de vos outils. Vos contenus privés (messages, documents) ne sont jamais lus ni stockés. Nous sommes 100% conformes RGPD et certifiés ISO 27001.'
    },
    {
      question: 'Combien de temps prend l\'intégration ?',
      answer: 'L\'intégration est instantanée pour la plupart des outils. En moyenne, connecter 10 outils prend moins de 15 minutes. Notre assistant IA vous guide pas à pas et détecte automatiquement vos outils existants.'
    },
    {
      question: 'Puis-je désactiver le monitoring à tout moment ?',
      answer: 'Absolument. Vous avez un contrôle total sur le monitoring. Vous pouvez désactiver des outils spécifiques, définir des plages horaires (respect du droit à la déconnexion), ou mettre en pause l\'analyse complète en un clic.'
    },
    {
      question: 'Comment fonctionne la détection des blocages ?',
      answer: 'Notre IA croise les métadonnées de vos outils (timestamps, statuts, assignations) pour identifier les patterns anormaux : tickets bloqués, canaux inactifs, PRs en attente, réunions improductives. Tout cela sans jamais lire vos contenus privés.'
    },
    {
      question: 'Puis-je personnaliser les alertes ?',
      answer: 'Oui, entièrement. Vous définissez vos propres seuils (ex: alerter si un ticket est bloqué > 3 jours), choisissez les canaux de notification (email, Slack, Teams), et créez des règles conditionnelles selon vos OKR.'
    },
    {
      question: 'Quelle est la différence avec un outil de monitoring classique ?',
      answer: 'Les outils classiques surveillent l\'infrastructure technique (serveurs, APIs). InsightFlow surveille la santé opérationnelle humaine : collaboration, vélocité, blocages organisationnels. C\'est un radar pour les frictions invisibles entre les équipes.'
    }
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Questions{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              fréquentes
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            Tout ce que vous devez savoir sur InsightFlow
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="text-cyan-400 flex-shrink-0" size={24} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
