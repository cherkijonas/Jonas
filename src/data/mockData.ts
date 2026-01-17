export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  context: string;
  aiAnalysis: string;
  solution: string;
  impact: string;
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'scan' | 'trend' | 'win' | 'note';
  message: string;
  tool?: string;
  timestamp: string;
  icon?: string;
}

export interface DashboardMetrics {
  healthScore: number;
  moneyWasted: number;
  ticketsStalled: number;
  avgResponseTime: number;
  clientSatisfaction: number;
  velocityData: Array<{
    date: string;
    completed: number;
    target: number;
  }>;
}

export interface IntegrationStatus {
  name: string;
  connected: boolean;
  icon: string;
  lastSync?: string;
}

export interface AppState {
  metrics: DashboardMetrics;
  alerts: Alert[];
  integrations: IntegrationStatus[];
  logs: string[];
  activityFeed: ActivityFeedItem[];
}

export const crisisData: AppState = {
  metrics: {
    healthScore: 34,
    moneyWasted: 4250,
    ticketsStalled: 12,
    avgResponseTime: 4.8,
    clientSatisfaction: 62,
    velocityData: [
      { date: 'Lun', completed: 3, target: 8 },
      { date: 'Mar', completed: 2, target: 8 },
      { date: 'Mer', completed: 4, target: 8 },
      { date: 'Jeu', completed: 1, target: 8 },
      { date: 'Ven', completed: 2, target: 8 },
      { date: 'Sam', completed: 0, target: 8 },
      { date: 'Dim', completed: 1, target: 8 },
    ],
  },
  alerts: [
    {
      id: 1,
      type: 'critical',
      title: 'Silence Client Détecté',
      description: 'Le ticket #402 \'Refonte Site Web\' est sans activité depuis 7 jours. Le dernier message du client est resté sans réponse.',
      context: 'Le ticket #402 "Refonte Site Web" n\'a aucune activité depuis 7 jours. Dernier message du client sans réponse.',
      aiAnalysis: 'Analyse : Client à haute valeur (12k€/mois). Ce silence est anormal et corrélé à un risque de départ de 67%.',
      solution: 'Envoyer un email de relance prioritaire (modèle \'VIP Care\') pour proposer un appel de mise au point.',
      impact: '12 000 €/mois à risque',
      timestamp: 'il y a 7 jours',
    },
    {
      id: 2,
      type: 'critical',
      title: 'Goulot d\'étranglement : Revue Créative',
      description: '5 tickets sont bloqués dans la colonne \'Revue\' depuis plus de 4 jours.',
      context: '5 tickets bloqués dans la colonne "Révision Créative" depuis > 4 jours. Temps moyen dans cette étape : 6,2 jours vs objectif 1 jour.',
      aiAnalysis: 'Julie Martinez est surchargée (340% de capacité). Elle est le seul point de validation, ce qui crée un blocage critique.',
      solution: 'Réassigner 2 tickets urgents à Thomas et activer la validation automatique pour les tâches mineures.',
      impact: '1 850 €/semaine en retards',
      timestamp: 'il y a 4 jours',
    },
    {
      id: 3,
      type: 'warning',
      title: 'Chaos Ping-Pong',
      description: 'Communication excessive en va-et-vient',
      context: 'Le ticket #309 "Charte Graphique" contient 45 commentaires sans résolution. 12 personnes différentes impliquées.',
      aiAnalysis: 'L\'analyse du fil révèle l\'absence de décideur. 78% des commentaires sont des questions de clarification. Aucun plan d\'action clair assigné. Ce pattern rallonge typiquement les délais de 3-4 semaines.',
      solution: 'Planifier un appel de synchronisation de 30min + Créer une matrice de décision',
      impact: '890 € en temps gaspillé',
      timestamp: 'il y a 2 jours',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Alerte Dérive du Périmètre',
      description: 'Extension des limites du projet',
      context: 'Le projet "Lancement E-commerce" comporte 23 demandes supplémentaires hors périmètre initial. Utilisation du budget : 94%.',
      aiAnalysis: 'Le client a ajouté 23 "petites modifications" en 3 semaines. Effort total estimé : 37 heures (~5 500 € de valeur). Aucun avenant soumis. L\'équipe absorbe les coûts.',
      solution: 'Générer une proposition d\'avenant + Planifier une revue du périmètre',
      impact: '5 500 € de travail non facturé',
      timestamp: 'il y a 1 jour',
    },
    {
      id: 5,
      type: 'info',
      title: 'Vélocité en Baisse',
      description: 'Production de l\'équipe en déclin',
      context: 'La vélocité du sprint a chuté de 40% sur les 2 dernières semaines. Complété : 13 tickets vs objectif 22.',
      aiAnalysis: 'Corrélation détectée : 4 membres de l\'équipe en congés + 2 nouveaux projets démarrés simultanément. Les données historiques montrent que la récupération prend 1-2 sprints après la fin de la période de congés.',
      solution: 'Ajuster les objectifs de sprint + Retarder les lancements de projets non critiques',
      impact: '1 200 €/semaine de coût d\'opportunité',
      timestamp: 'il y a 3 heures',
    },
    {
      id: 6,
      type: 'critical',
      title: 'Blocage Critique : Donnée Verrouillée',
      description: 'L\'opportunité Salesforce \'Contrat Alpha\' est bloquée. Le champ \'Marge\' dépend du fichier \'Pricing_Q4.xlsx\' actuellement ouvert en Lecture Seule sur le poste de \'Compta_02\' depuis 48h.',
      context: 'Dépendance croisée Salesforce ↔ Excel détectée. Fichier source verrouillé depuis 48h par poste \'Compta_02\'. Synchronisation CRM bloquée.',
      aiAnalysis: 'Dépendance croisée bloquante. L\'opportunité Salesforce ne peut pas être mise à jour car elle nécessite les données du fichier Excel qui est verrouillé en lecture seule. Impact : 3 commerciaux en attente, cycle de vente ralenti de 2 jours.',
      solution: 'Forcer la fermeture du fichier distant sur le poste \'Compta_02\' et relancer la synchronisation Salesforce automatiquement.',
      impact: '127 000 € d\'opportunité bloquée',
      timestamp: 'il y a 2 jours',
    },
    {
      id: 7,
      type: 'warning',
      title: 'Friction Opérationnelle (Outlook ↔ HubSpot)',
      description: 'Détection de 42 opérations de \'Copier-Coller\' entre Outlook et HubSpot ces 2 dernières heures par @Julie.',
      context: 'Pattern de travail manuel détecté : 42 copier-coller répétitifs Outlook → HubSpot en 2h. Temps estimé : 45 min.',
      aiAnalysis: 'Perte de temps estimée : 45 min/jour soit 3h45 par semaine. Risque d\'erreur de saisie manuel : 18%. Le connecteur natif Outlook-HubSpot est disponible mais non activé. ROI de l\'activation : économie de 780 € par mois.',
      solution: 'Activer le connecteur natif Outlook-HubSpot pour l\'import automatique des contacts et éliminer les tâches manuelles.',
      impact: '780 €/mois de temps perdu',
      timestamp: 'il y a 2 heures',
    },
    {
      id: 8,
      type: 'critical',
      title: 'Rupture de Chaîne d\'Information',
      description: 'Le ticket Jira \'Bug Paiement\' est en attente depuis 5 jours. La solution technique a pourtant été donnée dans le canal Slack #Dev il y a 3 jours, mais n\'a pas été liée.',
      context: 'Ticket Jira #PAY-2847 bloqué depuis 5 jours. Solution technique publiée dans Slack #Dev il y a 3 jours par @Thomas. Aucun lien entre les deux systèmes.',
      aiAnalysis: 'Rupture de communication inter-outils. Le développeur assigné au ticket Jira n\'est pas dans le canal Slack où la solution a été partagée. Pattern récurrent : 23% des tickets sont résolus dans Slack mais restent ouverts dans Jira.',
      solution: 'Lier automatiquement le thread Slack au ticket Jira #PAY-2847 et notifier le développeur assigné pour débloquer la résolution.',
      impact: '5 jours de retard client',
      timestamp: 'il y a 5 jours',
    },
    {
      id: 9,
      type: 'warning',
      title: 'Tâche Trello en Souffrance',
      description: 'La carte \'Refonte Homepage\' est marquée \'En cours\' depuis 15 jours, mais aucune métadonnée d\'activité (Fichier, Commit, Commentaire) n\'a été détectée.',
      context: 'Carte Trello #HOME-001 en statut \'En cours\' depuis 15 jours. Aucune activité détectée : 0 commentaire, 0 commit GitHub, 0 fichier modifié.',
      aiAnalysis: 'Dissonance entre le statut déclaré et l\'activité réelle. La carte semble abandonnée mais bloque visuellement le workflow. 67% de probabilité que le propriétaire ait oublié cette tâche ou qu\'elle soit devenue obsolète.',
      solution: 'Archiver automatiquement la tâche ou envoyer une notification urgente au propriétaire pour confirmation du statut réel.',
      impact: 'Visibilité workflow dégradée',
      timestamp: 'il y a 15 jours',
    },
  ],
  integrations: [
    { name: 'Trello', connected: true, icon: 'trello', lastSync: 'il y a 2 minutes' },
    { name: 'Slack', connected: true, icon: 'slack', lastSync: 'il y a 5 minutes' },
    { name: 'GitHub', connected: false, icon: 'github' },
    { name: 'Jira', connected: false, icon: 'jira' },
  ],
  logs: [
    '> Analyse du tableau Trello "Campagne Q4"...',
    '> Détection de 12 tickets bloqués sur 3 projets',
    '> Scan de l\'espace Slack pour les lacunes de communication...',
    '> Trouvé 3 messages clients sans réponse (> 48h)',
    '> Exécution de l\'algorithme de détection des goulots...',
    '> Alerte : Colonne Révision Créative surchargée',
    '> Solutions IA générées pour 5 problèmes critiques',
    '> En attente d\'action utilisateur...',
  ],
  activityFeed: [
    {
      id: 'feed-1',
      type: 'scan',
      message: 'Connexion API Salesforce établie. Synchronisation des 50 derniers deals...',
      tool: 'Salesforce',
      timestamp: 'il y a 2 min',
    },
    {
      id: 'feed-2',
      type: 'win',
      message: 'Succès : L\'objectif \'Zéro Inbox\' a été atteint par le service Client ce matin.',
      timestamp: 'il y a 15 min',
    },
    {
      id: 'feed-3',
      type: 'scan',
      message: 'Scan de sécurité Slack terminé. Aucun token exposé détecté.',
      tool: 'Slack',
      timestamp: 'il y a 28 min',
    },
    {
      id: 'feed-4',
      type: 'trend',
      message: 'Tendance : Hausse de 15% de l\'activité sur Jira ce mardi par rapport à la moyenne.',
      tool: 'Jira',
      timestamp: 'il y a 45 min',
    },
    {
      id: 'feed-5',
      type: 'note',
      message: 'Note : 3 licences Zoom inutilisées détectées. Économie potentielle de 120€/mois.',
      tool: 'Zoom',
      timestamp: 'il y a 1h',
    },
    {
      id: 'feed-6',
      type: 'win',
      message: 'Performance : Le temps de réponse moyen sur Intercom est passé sous les 2 minutes.',
      tool: 'Intercom',
      timestamp: 'il y a 1h 30min',
    },
    {
      id: 'feed-7',
      type: 'trend',
      message: 'Focus : L\'équipe Marketing est très active sur le canal #Campagne-Été (+40 messages).',
      tool: 'Slack',
      timestamp: 'il y a 2h',
    },
    {
      id: 'feed-8',
      type: 'scan',
      message: 'Analyse GitHub : 12 pull requests en attente de revue. Délai moyen : 3 jours.',
      tool: 'GitHub',
      timestamp: 'il y a 2h 15min',
    },
    {
      id: 'feed-9',
      type: 'note',
      message: 'Observation : Le sprint actuel est à 65% de complétion avec 3 jours restants.',
      tool: 'Jira',
      timestamp: 'il y a 3h',
    },
    {
      id: 'feed-10',
      type: 'scan',
      message: 'Synchronisation HubSpot : 27 nouveaux contacts importés depuis hier.',
      tool: 'HubSpot',
      timestamp: 'il y a 3h 30min',
    },
    {
      id: 'feed-11',
      type: 'win',
      message: 'Milestone atteint : 100 tickets Trello terminés ce mois-ci. Record mensuel !',
      tool: 'Trello',
      timestamp: 'il y a 4h',
    },
    {
      id: 'feed-12',
      type: 'trend',
      message: 'Analyse : Les réunions Zoom durent en moyenne 15% moins longtemps cette semaine.',
      tool: 'Zoom',
      timestamp: 'il y a 5h',
    },
  ],
};

export const healthyData: AppState = {
  metrics: {
    healthScore: 89,
    moneyWasted: 0,
    ticketsStalled: 1,
    avgResponseTime: 1.2,
    clientSatisfaction: 94,
    velocityData: [
      { date: 'Lun', completed: 8, target: 8 },
      { date: 'Mar', completed: 9, target: 8 },
      { date: 'Mer', completed: 7, target: 8 },
      { date: 'Jeu', completed: 8, target: 8 },
      { date: 'Ven', completed: 10, target: 8 },
      { date: 'Sam', completed: 3, target: 8 },
      { date: 'Dim', completed: 2, target: 8 },
    ],
  },
  alerts: [
    {
      id: 6,
      type: 'info',
      title: 'Tous les Systèmes Nominaux',
      description: 'Agence opérant à efficacité maximale',
      context: 'Tous les projets sur la bonne voie. Aucun problème critique détecté. Vélocité d\'équipe stable.',
      aiAnalysis: 'Les métriques de performance actuelles dépassent les benchmarks du secteur de 23%. Satisfaction client à son plus haut niveau. Action recommandée : Maintenir les patterns de workflow actuels.',
      solution: 'Continuer la surveillance',
      impact: 'Trajectoire positive',
      timestamp: 'À l\'instant',
    },
  ],
  integrations: [
    { name: 'Trello', connected: true, icon: 'trello', lastSync: 'À l\'instant' },
    { name: 'Slack', connected: true, icon: 'slack', lastSync: 'À l\'instant' },
    { name: 'GitHub', connected: true, icon: 'github', lastSync: 'il y a 1 minute' },
    { name: 'Jira', connected: true, icon: 'jira', lastSync: 'il y a 3 minutes' },
  ],
  logs: [
    '> Tous les systèmes opérationnels',
    '> Score de santé : 89% (Excellent)',
    '> Zéro alerte critique',
    '> Satisfaction client : 94%',
    '> Vélocité d\'équipe : Sur la cible',
    '> Surveillance en cours...',
  ],
  activityFeed: [
    {
      id: 'feed-h1',
      type: 'win',
      message: 'Tous les systèmes fonctionnent à 100% de capacité. Score de santé : Excellent.',
      timestamp: 'À l\'instant',
    },
    {
      id: 'feed-h2',
      type: 'scan',
      message: 'Scan complet des intégrations terminé. Aucune anomalie détectée.',
      timestamp: 'il y a 5 min',
    },
    {
      id: 'feed-h3',
      type: 'win',
      message: 'Record : Satisfaction client à 94%. Meilleur score de l\'année !',
      timestamp: 'il y a 15 min',
    },
    {
      id: 'feed-h4',
      type: 'trend',
      message: 'Vélocité d\'équipe stable. Objectifs de sprint atteints à 100%.',
      tool: 'Jira',
      timestamp: 'il y a 30 min',
    },
    {
      id: 'feed-h5',
      type: 'scan',
      message: 'Synchronisation Slack : Temps de réponse moyen < 1 minute.',
      tool: 'Slack',
      timestamp: 'il y a 1h',
    },
    {
      id: 'feed-h6',
      type: 'win',
      message: 'GitHub : Tous les PR ont été revus en moins de 24h cette semaine.',
      tool: 'GitHub',
      timestamp: 'il y a 2h',
    },
  ],
};

export const emptyStateData: AppState = {
  metrics: {
    healthScore: 0,
    moneyWasted: 0,
    ticketsStalled: 0,
    avgResponseTime: 0,
    clientSatisfaction: 0,
    velocityData: [],
  },
  alerts: [],
  integrations: [
    { name: 'Trello', connected: false, icon: 'trello' },
    { name: 'Slack', connected: false, icon: 'slack' },
    { name: 'GitHub', connected: false, icon: 'github' },
    { name: 'Jira', connected: false, icon: 'jira' },
  ],
  logs: ['> En attente des intégrations...'],
  activityFeed: [],
};

export const realModeData: AppState = {
  metrics: {
    healthScore: 50,
    moneyWasted: 0,
    ticketsStalled: 0,
    avgResponseTime: 0,
    clientSatisfaction: 0,
    velocityData: [
      { date: 'Lun', completed: 0, target: 0 },
      { date: 'Mar', completed: 0, target: 0 },
      { date: 'Mer', completed: 0, target: 0 },
      { date: 'Jeu', completed: 0, target: 0 },
      { date: 'Ven', completed: 0, target: 0 },
      { date: 'Sam', completed: 0, target: 0 },
      { date: 'Dim', completed: 0, target: 0 },
    ],
  },
  alerts: [],
  integrations: [],
  logs: ['> Système en attente. En attente de connexion des outils...'],
  activityFeed: [],
};
