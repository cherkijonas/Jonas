export interface Issue {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  pointsReward: number;
  category: string;
  affectedSystems: string[];
  estimatedTimeToFix: string;
  resolved: boolean;
  icon: string;
  sourceTool?: string;
  toolIcon?: string;
  toolColor?: string;
  verificationUrl?: string;
  visualContext?: {
    type: 'code' | 'data';
    title: string;
    content: string;
  };
  aiSolution?: {
    analysis: string;
    recommendation: string;
    actionLink: string;
    actionLabel: string;
  };
}

export const mockIssues: Issue[] = [
  {
    id: 'excel-ghost',
    title: 'Fichier Fantôme Excel Détecté',
    description: 'Un fichier Excel critique est modifié simultanément par 3 systèmes différents, causant des conflits de données. Cela bloque 8 flux automatisés.',
    impact: 'high',
    pointsReward: 8,
    category: 'Intégrité des Données',
    affectedSystems: ['SharePoint', 'Power Automate', 'Zapier'],
    estimatedTimeToFix: '30 secondes',
    resolved: false,
    icon: '📊',
    aiSolution: {
      analysis: 'J\'ai analysé les accès : le fichier \'Budget_Q1_2025.xlsx\' est sollicité en même temps par SharePoint, Power Automate et Zapier. Cela crée des conflits de version toutes les 4 minutes.',
      recommendation: 'Mettre en pause le flux Power Automate et forcer une sauvegarde unique via l\'API SharePoint.',
      actionLink: 'https://admin.microsoft.com/sharepoint',
      actionLabel: 'Configurer SharePoint',
    },
  },
  {
    id: 'teams-zombie',
    title: 'Réunions Teams Fantômes',
    description: 'Des salles de réunion Teams abandonnées consomment des crédits API et génèrent des notifications fantômes. 12 réunions fantômes détectées en 24 heures.',
    impact: 'medium',
    pointsReward: 6,
    category: 'Gaspillage de Ressources',
    affectedSystems: ['Microsoft Teams', 'API Calendrier', 'Service de Notification'],
    estimatedTimeToFix: '20 secondes',
    resolved: false,
    icon: '🧟',
    aiSolution: {
      analysis: 'Cause racine identifiée : Les salles de réunion sont créées automatiquement mais les webhooks de nettoyage échouent silencieusement en raison d\'un problème de rafraîchissement de jeton. Cela a généré 12 instances de réunions orphelines consommant environ 47$/jour en appels API et envoyant plus de 340 notifications inutiles.',
      recommendation: 'Déployer un script de nettoyage automatisé qui s\'exécute toutes les heures pour identifier les réunions sans participants actifs depuis plus de 15 minutes et les terminer proprement. Implémenter également une gestion d\'erreur appropriée pour le rafraîchissement des jetons de webhook. Économies estimées : 1 400$/mois.',
      actionLink: 'https://admin.teams.microsoft.com',
      actionLabel: 'Ouvrir Admin Teams',
    },
  },
  {
    id: 'slack-overload',
    title: 'Surcharge Canal Slack',
    description: 'Le canal #general contient 847 messages webhook non traités causant des retards dans les alertes critiques. Latence de traitement : 45 minutes.',
    impact: 'medium',
    pointsReward: 4,
    category: 'Communication',
    affectedSystems: ['Slack', 'Gestionnaire Webhook', 'Système d\'Alerte'],
    estimatedTimeToFix: '15 secondes',
    resolved: false,
    icon: '💬',
    aiSolution: {
      analysis: 'Le canal #general est devenu un fourre-tout pour les notifications automatisées, résultant en 847 messages non traités et un délai de traitement de 45 minutes. Les alertes haute priorité sont noyées dans le bruit, créant un angle mort critique pour votre équipe. Le gestionnaire de webhook tente de traiter les messages séquentiellement, causant un retard.',
      recommendation: 'Implémenter une stratégie de routage de canal : Créer des canaux dédiés pour différents types d\'alertes (#alertes-critiques, #alertes-info, #alertes-deploiements). Archiver les 847 messages en retard et configurer les webhooks pour router vers les canaux appropriés selon le niveau de priorité. Cela réduira le bruit de 89% et ramènera la latence des alertes sous 30 secondes.',
      actionLink: 'https://app.slack.com/client',
      actionLabel: 'Aller sur Slack',
    },
  },
  {
    id: 'notion-naming-inconsistency',
    title: 'Incohérence Nommage Notion',
    description: 'Les membres de l\'équipe utilisent des conventions de nommage incohérentes pour les pages projet, rendant la recherche moins efficace.',
    impact: 'low',
    pointsReward: 2,
    category: 'Documentation',
    affectedSystems: ['Notion', 'Index de Recherche'],
    estimatedTimeToFix: '10 secondes',
    resolved: false,
    icon: '📝',
    aiSolution: {
      analysis: 'L\'analyse de plus de 200 pages Notion révèle 12 modèles de nommage différents utilisés dans l\'espace de travail. Certaines pages utilisent "Projet : Nom", d\'autres "[Nom] Projet", et certaines n\'ont aucun préfixe. Cette incohérence réduit l\'efficacité de la recherche de 23%.',
      recommendation: 'Établir un modèle de convention de nommage standard et le documenter dans le wiki de l\'équipe. Renommer en masse les pages existantes pour suivre le nouveau standard. Envisager d\'utiliser des modèles Notion avec des modèles de nommage pré-remplis pour les nouveaux projets.',
      actionLink: 'https://www.notion.so',
      actionLabel: 'Ouvrir Notion',
    },
  },
  {
    id: 'calendar-sync-delay',
    title: 'Léger Retard Sync Calendrier',
    description: 'Les événements Google Calendar se synchronisent avec un retard de 2 minutes. Pas critique mais à surveiller.',
    impact: 'low',
    pointsReward: 1,
    category: 'Synchronisation',
    affectedSystems: ['Google Calendar', 'API Calendrier'],
    estimatedTimeToFix: '5 secondes',
    resolved: false,
    icon: '📅',
    aiSolution: {
      analysis: 'La synchronisation de l\'API Calendrier montre une latence constante de 2 minutes lorsque les événements sont créés ou modifiés. Ceci est dans les paramètres acceptables mais supérieur au temps de synchronisation typique de 30 secondes. Probablement causé par la limitation du débit de l\'API ou la logique de réessai des webhooks.',
      recommendation: 'Surveiller le délai de synchronisation pendant les prochaines 48 heures. S\'il dépasse 5 minutes, examiner la configuration des webhooks et les limites de quota de l\'API. Pour l\'instant, ceci est informatif et ne nécessite aucune action immédiate.',
      actionLink: 'https://calendar.google.com',
      actionLabel: 'Ouvrir Calendrier',
    },
  },
];
