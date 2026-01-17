# Guide du Système d'Analyse IA

## Vue d'ensemble

Le système d'analyse IA détecte automatiquement les problèmes sur vos outils connectés et génère des recommandations intelligentes pour les résoudre en utilisant GPT-4.

## Configuration

### 1. Clé API OpenAI

Pour activer l'analyse IA complète, ajoutez votre clé API OpenAI dans le fichier `.env`:

```env
VITE_OPENAI_API_KEY=sk-...votre_cle_api
```

**Obtenir une clé API:**
1. Créez un compte sur [OpenAI Platform](https://platform.openai.com)
2. Allez dans [API Keys](https://platform.openai.com/api-keys)
3. Créez une nouvelle clé secrète
4. Copiez et collez-la dans votre `.env`

**Mode Fallback:**
Si aucune clé n'est fournie, le système utilise des données de démonstration pour montrer les fonctionnalités.

## Fonctionnement

### 1. Détection Automatique

Quand vous connectez un outil dans l'onglet **Tableau de Bord**:

1. **Connexion de l'outil** → Enregistrement dans la base de données
2. **Analyse IA déclenchée** → Notification visuelle en temps réel
3. **Détection des problèmes** → Analyse par GPT-4
4. **Sauvegarde** → Problèmes enregistrés avec recommandations

### 2. Types de Problèmes Détectés

Le système analyse 5 catégories:

- **🔧 Friction**: Difficultés d'utilisation, processus complexes
- **⚡ Performance**: Lenteurs, temps de réponse élevés
- **💰 Coût**: Dépenses inutiles, licences non utilisées
- **🔒 Sécurité**: Vulnérabilités, problèmes de sécurité
- **🔄 Workflow**: Processus inefficaces, redondances

### 3. Niveaux de Gravité

Chaque problème est classé:

- **CRITICAL** (Rouge) - Action immédiate requise
- **HIGH** (Orange) - Important, à résoudre rapidement
- **MEDIUM** (Ambre) - Modéré, peut attendre
- **LOW** (Cyan) - Mineur, amélioration suggérée

## Interface Utilisateur

### Onglet Insights

Accessible depuis le dashboard employé, l'onglet **Insights** affiche:

#### 1. Statistiques Globales

4 cartes avec métriques en temps réel:
- Problèmes actifs
- Problèmes critiques
- Problèmes résolus
- Total général

#### 2. Panneau des Problèmes Actifs

Liste interactive avec:
- Badge de gravité (couleur + niveau)
- Type de problème
- Nom de l'outil concerné
- Date de détection
- Description détaillée
- **Recommandation IA** (cliquer pour développer)

**Actions disponibles:**
- Prendre connaissance
- Marquer en cours de résolution
- Marquer comme résolu

#### 3. Widget Problèmes Résolus

Affiche les 5 derniers problèmes résolus avec:
- Titre du problème
- Type (emoji)
- Outil concerné
- Temps écoulé depuis résolution

## Base de Données

### Tables Créées

**tool_problems**
```sql
- id (uuid)
- user_id (uuid)
- integration_id (uuid)
- tool_name (text)
- problem_type (friction|performance|cost|security|workflow)
- severity (low|medium|high|critical)
- title (text)
- description (text)
- ai_recommendation (text)
- detected_at (timestamp)
- status (detected|acknowledged|in_progress|solved)
- solved_at (timestamp, nullable)
- metadata (jsonb)
```

**ai_analysis_logs**
```sql
- id (uuid)
- user_id (uuid)
- integration_id (uuid)
- analysis_type (text)
- prompt (text)
- response (text)
- tokens_used (integer)
- created_at (timestamp)
```

## Services

### aiAnalysisService

**Méthodes principales:**

```typescript
// Analyser un outil connecté
analyzeToolIntegration(request: ToolAnalysisRequest): Promise<DetectedProblem[]>

// Sauvegarder les problèmes détectés
saveDetectedProblems(userId, integrationId, toolName, problems): Promise<void>

// Récupérer les problèmes actifs
getActiveProblems(userId): Promise<Problem[]>

// Mettre à jour le statut d'un problème
updateProblemStatus(problemId, status): Promise<void>

// Récupérer les problèmes résolus
getSolvedProblems(userId): Promise<Problem[]>

// Obtenir les statistiques
getAnalysisStats(userId): Promise<Stats>
```

## Flux de Données

```
1. Utilisateur clique sur un outil
   ↓
2. ToolIntegrationGrid.handleConnectTool()
   ↓
3. employeeProfileService.connectTool() → Crée l'intégration
   ↓
4. aiAnalysisService.analyzeToolIntegration() → Appel GPT-4
   ↓
5. aiAnalysisService.saveDetectedProblems() → Sauvegarde en BDD
   ↓
6. Notification visuelle "Analyse IA en cours"
   ↓
7. Problèmes visibles dans l'onglet Insights
```

## Composants

### AIProblemsPanel

Affichage principal des problèmes détectés avec:
- Statistiques en temps réel
- Liste interactive avec expansion
- Actions de gestion de statut
- Design responsive avec animations

### SolvedProblemsWidget

Widget compact affichant les succès:
- 5 derniers problèmes résolus
- Emojis par type
- Temps relatif
- Message de félicitation

### ToolIntegrationGrid (amélioré)

Ajout de:
- Notification d'analyse en cours
- Intégration automatique avec l'IA
- Feedback visuel avec Sparkles

## Personnalisation

### Modifier le Prompt IA

Éditez `aiAnalysisService.ts` ligne ~50:

```typescript
const prompt = `
Analyse l'intégration de l'outil suivant...
[Votre prompt personnalisé]
`;
```

### Changer le Modèle GPT

Ligne ~35:

```typescript
model: 'gpt-4', // Changez en 'gpt-3.5-turbo' pour réduire les coûts
```

### Ajuster le Timeout

Dans `ToolIntegrationGrid.tsx` ligne ~135:

```typescript
setTimeout(() => {
  setAnalyzingTool(null);
}, 2000); // Modifiez la durée (ms)
```

## Bonnes Pratiques

1. **Clé API sécurisée**: Ne commitez JAMAIS votre `.env` avec la vraie clé
2. **Coûts**: Surveillez l'usage de votre API OpenAI (tokens utilisés)
3. **Fallback**: Le mode démonstration fonctionne sans clé API
4. **Performance**: L'analyse se fait en arrière-plan, pas de blocage UI
5. **Données**: Les logs IA sont conservés pour audit

## Dépannage

### "Aucun problème détecté"

- Vérifiez que la clé API est correcte
- Consultez la console browser pour les erreurs
- Vérifiez la table `ai_analysis_logs` en BDD

### "Analysis failed"

- Quota API OpenAI dépassé
- Clé API invalide ou expirée
- Problème réseau

### Les problèmes ne s'affichent pas

- Actualisez l'onglet Insights
- Vérifiez que userId correspond
- Consultez la table `tool_problems` en BDD

## Roadmap

Fonctionnalités futures potentielles:
- Analyse planifiée récurrente
- Notifications push pour problèmes critiques
- Export PDF des rapports
- Graphiques de tendances
- Comparaisons inter-équipes
- Intégration Slack/Teams pour alertes

## Support

Pour toute question ou problème:
1. Consultez les logs dans la console
2. Vérifiez la documentation OpenAI
3. Testez en mode démonstration d'abord
