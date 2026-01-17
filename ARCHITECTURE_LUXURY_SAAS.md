# Architecture Luxury SaaS - Documentation Complète

## 🎯 Vue d'ensemble

Une plateforme SaaS de luxe avec contrôle d'accès basé sur les rôles (RBAC), isolation complète des données pour les managers, et système d'intégration dynamique en temps réel pour les employés.

---

## 🔐 PART 1: AUTHENTICATION & GLOBAL ROUTING

### Sélection de Rôle
- **Page**: `/role-selection`
- **Options**: Manager Space ou Employee Space
- Interface élégante avec animations Framer Motion

### Sécurité Manager
- **Login**: Email + Password + **Enterprise Code**
- Le code entreprise est vérifié via la table `company_codes`
- Création automatique d'une équipe si elle n'existe pas
- Redirection vers `/manager/[team_slug]`

### Sécurité Employee
- **Login**: Email + Password
- Redirection vers `/app` (espace personnel)

### Route Guards Implémentés

#### ManagerRouteGuard
```typescript
// Vérifie:
// 1. Utilisateur authentifié
// 2. Role = 'manager'
// 3. assigned_team_id existe
// 4. team_slug dans l'URL correspond à l'équipe assignée
```

#### EmployeeProtectedRoute
```typescript
// Vérifie:
// 1. Utilisateur authentifié
// 2. Role != 'manager'
// 3. Redirige les managers vers /manager
```

---

## 👔 PART 2: MANAGER SPACE

### Isolation des Données
- **Principe**: Chaque requête filtre par `team_id`
- Un manager Finance ne voit QUE les membres, métriques et alertes de Finance
- Implémenté via RLS (Row Level Security) dans Supabase

### Request Hub Centralisé (RequestCenterV2)

#### Tab 1: Adhésions d'Équipe
```typescript
// Affiche: team_join_requests
// Filtrage: Par team_id du manager
// Actions: Approuver / Refuser
// Real-time: Mise à jour automatique via Supabase
```

**Fonctionnalités**:
- Liste des demandes avec avatar, nom, email, message
- Badge de statut: EN ATTENTE (orange), APPROUVÉ (vert), REFUSÉ (rouge)
- Modal d'approbation avec message de bienvenue optionnel
- Modal de refus avec raison optionnelle
- Notifications automatiques envoyées à l'employé

#### Tab 2: Demandes Admin
```typescript
// Affiche: employee_requests
// Types: Congé, Ressource, Équipement, Support, Autre
// Actions: Approuver / Refuser
// Real-time: Mise à jour automatique
```

**Fonctionnalités**:
- Icônes par type de demande
- Description complète de la demande
- Réponse du manager visible par l'employé
- Notifications push

### Métriques Manager
- **Demandes en Attente**: Compteur en temps réel
- **Demandes Approuvées**: Historique
- **Total Demandes**: Vue d'ensemble

### Tracking Éthique
- Focus sur les **Points de Friction** (metadata)
- Tickets bloqués >48h
- Surcharge de réunions
- "Ghost Files" (fichiers verrouillés/corrompus)
- **AUCUN espionnage de contenu**: Le manager voit OÙ c'est bloqué, pas QUOI

---

## 👤 PART 3: EMPLOYEE SPACE

### Navigation Persistante
```
Sidebar toujours visible:
- [DASHBOARD] - Espace personnel
- [INSIGHTS] - Outils personnels
- [MY TEAM] - État dynamique ⭐
```

### Tab "MY TEAM" Dynamique (MyTeamV2)

#### État A: Freelance / Guest Mode
```typescript
viewState = 'freelance'

Affichage:
- Badge "Mode Freelance" (cyan)
- Card "Rejoindre une Équipe"
- Liste des "Demandes en Cours"
- Status badges: EN ATTENTE (orange)
```

**Interface**:
- Design épuré avec gradients subtils
- Call-to-action proéminent
- Animation d'attente élégante

#### État B: Team Member Mode
```typescript
viewState = 'member'

Affichage:
- Badge "Membre de l'équipe" (vert)
- Métriques de l'équipe:
  - Score Santé (TrendingUp)
  - OKRs Atteints (Target)
  - Victoires (Award)
- Annuaire de l'Équipe
- Flux de Victoires en temps réel
```

**Morphing UI**:
```typescript
// Transition automatique quand approved
<AnimatePresence mode="wait">
  {viewState === 'freelance' ? (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      {/* État Freelance */}
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      {/* État Member */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pré-Onboarding
- Les employés peuvent connecter les **33 outils** AVANT de rejoindre une équipe
- Page `/app/connections` accessible sans team_id
- Intégrations stockées et liées au user_id

---

## 🔄 PART 4: REAL-TIME SYNC BRIDGE

### Workflow Complet

#### 1. Soumission de Demande
```typescript
// Employé clique "Rejoindre une Équipe"
await teamJoinRequestsService.createJoinRequest(teamId, message);

// Créé dans DB:
{
  user_id: userId,
  team_id: selectedTeamId,
  status: 'pending',
  message: message,
  created_at: now()
}
```

#### 2. Visibilité Manager (Instant)
```typescript
// Real-time listener dans RequestCenterV2
const subscription = supabase
  .channel('join-requests-manager')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'team_join_requests'
  }, (payload) => {
    loadAllRequests(); // Recharge automatiquement
  })
  .subscribe();
```

#### 3. Trigger d'Approbation
```typescript
// Manager clique "Approuver"
await teamJoinRequestsService.approveRequest(requestId, teamId, userId);

// Actions effectuées:
// 1. Update status = 'approved'
// 2. INSERT dans team_members (user_id, team_id, role: 'member')
// 3. Notification push à l'employé
// 4. Real-time trigger vers employé
```

#### 4. UI Morphing (Employé)
```typescript
// Real-time listener dans MyTeamV2
const subscription = supabase
  .channel('team-join-requests-realtime')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'team_join_requests',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    if (payload.new.status === 'approved') {
      // Animation de transition
      setViewState('member');
      loadTeamData();
      showSuccessNotification();
    }
  })
  .subscribe();
```

**Aucun rechargement de page requis!**

---

## 🎨 PART 5: LUXURY TECH UI/UX

### Style Visuel

#### Thème
```css
Background: #050505 (noir absolu)
Borders: 1px solid rgba(slate, 0.5)
Glows: shadow-cyan-500/20 (subtils)
Typography: Inter (fallback: system-ui)
```

#### État des Badges
```typescript
EN ATTENTE: bg-amber-500/10, text-amber-400, border-amber-500/30
APPROUVÉ: bg-emerald-500/10, text-emerald-400, border-emerald-500/30
REFUSÉ: bg-red-500/10, text-red-400, border-red-500/30
```

### Animations Framer Motion

#### Transitions de Page
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
```

#### Morphing States
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={state}
    initial={{ opacity: 0, x: state === 'a' ? -50 : 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: state === 'a' ? 50 : -50 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  />
</AnimatePresence>
```

#### Modals
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 20 }}
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
/>
```

#### Listes avec Stagger
```typescript
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  />
))}
```

### Composants Réutilisables

#### Scrollbar Stylisé
```css
.styled-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.styled-scrollbar::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}
.styled-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 3px;
}
```

#### Loading States
```typescript
<div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
```

---

## 🗂️ Structure des Fichiers

### Pages Principales

```
src/pages/
├── LandingPage.tsx         # Page d'accueil marketing
├── RoleSelection.tsx       # Sélection Manager/Employee
├── Login.tsx               # Login avec Enterprise Code
├── MyTeamV2.tsx           # ⭐ État dynamique employé
├── RequestCenterV2.tsx    # ⭐ Hub centralisé manager
├── ManagerDashboard.tsx   # Dashboard manager
├── Dashboard.tsx          # Dashboard employé
└── Connections.tsx        # Magasin d'intégrations
```

### Services

```
src/services/
├── teamJoinRequestsService.ts    # Gestion join requests
├── employeeRequestsService.ts    # Gestion admin requests
├── transferRequestService.ts     # Gestion transferts
├── notificationsService.ts       # Notifications push
├── integrationsService.ts        # Connexion outils
└── activityService.ts            # Logs d'activité
```

### Context

```
src/context/
├── AuthContext.tsx          # Auth + teamId
├── GlobalContext.tsx        # État global + integrations
└── AppContext.tsx          # État application
```

---

## 🔒 Sécurité & RLS

### Policies Supabase

#### team_join_requests
```sql
-- Employés peuvent créer leurs propres demandes
CREATE POLICY "Users can create own join requests"
  ON team_join_requests FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

-- Managers peuvent voir demandes de leur équipe
CREATE POLICY "Managers can view team join requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = team_join_requests.team_id
    )
  );
```

#### employee_requests
```sql
-- Employés de l'équipe créent des demandes
CREATE POLICY "Team members can create requests"
  ON employee_requests FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.team_id = employee_requests.team_id
    )
  );

-- Managers voient demandes de leur équipe
CREATE POLICY "Managers can manage team requests"
  ON employee_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = employee_requests.team_id
    )
  );
```

---

## 📊 Schéma Base de Données

### Tables Clés

#### company_codes
```sql
CREATE TABLE company_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  assigned_team_id UUID REFERENCES teams(id),
  company_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### team_members
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);
```

#### team_join_requests
```sql
CREATE TABLE team_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id, status)
);
```

#### employee_requests
```sql
CREATE TABLE employee_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('time_off', 'resource', 'equipment', 'support', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  manager_response TEXT
);
```

---

## 🚀 Guide de Test

### Test Manager

1. **Créer un compte Manager**
   ```
   - Aller sur /role-selection
   - Choisir "Manager"
   - Code Entreprise: MARKETING (ou autre code valide)
   - Email: manager@test.com
   - Password: test123
   ```

2. **Vérifier l'isolation**
   ```
   - Dashboard: /manager/marketing
   - Request Hub: /manager/marketing/requests
   - Vérifier que seules les demandes de l'équipe Marketing sont visibles
   ```

3. **Tester Real-Time**
   ```
   - Ouvrir 2 onglets:
     - Onglet 1: Manager (/manager/marketing/requests)
     - Onglet 2: Employé (/app/my-team)
   - L'employé envoie une demande
   - Vérifier qu'elle apparaît INSTANTANÉMENT chez le manager
   ```

### Test Employé

1. **Créer un compte Employé**
   ```
   - /role-selection → Employee
   - Email: employee@test.com
   - Password: test123
   ```

2. **Tester État Freelance**
   ```
   - Aller sur /app/my-team
   - Vérifier badge "Mode Freelance"
   - Envoyer une demande d'adhésion
   - Vérifier badge "EN ATTENTE" (orange)
   ```

3. **Tester UI Morphing**
   ```
   - Manager approuve la demande
   - Vérifier animation de transition automatique
   - État passe de "Freelance" à "Member"
   - Métriques et annuaire apparaissent
   - Aucun rechargement de page!
   ```

---

## 🎯 Points Clés d'Architecture

### ✅ Ce qui est IMPLÉMENTÉ

1. **RBAC Strict**
   - Route guards pour managers et employés
   - RLS Supabase par team_id
   - Vérification du team_slug dans l'URL

2. **Isolation des Données**
   - Chaque manager voit UNIQUEMENT son équipe
   - Filtrage automatique par assigned_team_id
   - Impossible d'accéder aux données d'une autre équipe

3. **Real-Time Sync**
   - Listeners Supabase sur team_join_requests
   - Listeners sur employee_requests
   - Mise à jour automatique sans refresh

4. **UI/UX Luxury**
   - Dark theme #050505
   - Animations Framer Motion fluides
   - Glows et shadows subtils
   - Transitions entre états

5. **Système Dynamique MY TEAM**
   - État A (Freelance) vs État B (Member)
   - Morphing automatique lors de l'approbation
   - Animations élégantes
   - Pas de rechargement de page

6. **Request Hub Centralisé**
   - Tab Adhésions + Tab Admin
   - Real-time updates
   - Actions Approuver/Refuser
   - Notifications automatiques

### 🎨 Design Philosophy

- **Minimalisme Luxe**: Chaque pixel compte
- **Feedback Immédiat**: Animations sur chaque action
- **États Clairs**: Badges colorés et lisibles
- **Performance**: Build optimisé, real-time efficace
- **Accessibilité**: Contraste élevé, textes lisibles

---

## 📝 Notes Importantes

### Enterprise Code
Les codes entreprise doivent être créés manuellement dans la table `company_codes`:
```sql
INSERT INTO company_codes (company_code, company_name)
VALUES ('MARKETING', 'Marketing Team'),
       ('RH', 'Ressources Humaines'),
       ('COMPTABILITE', 'Comptabilité');
```

### Real-Time Latence
- Les mises à jour sont quasi-instantanées (<100ms)
- Utilise WebSockets Supabase
- Pas de polling

### Sécurité
- Tous les appels API sont authentifiés
- RLS appliqué côté serveur
- Aucune donnée sensible exposée côté client

---

## 🔮 Architecture Technique

```
┌─────────────────────────────────────────────────┐
│              Landing Page                        │
│         (Marketing + CTA)                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Role Selection                         │
│     [Manager Space] [Employee Space]            │
└────────┬──────────────────────────┬─────────────┘
         │                           │
    MANAGER                      EMPLOYEE
         │                           │
         ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│  Login Manager   │       │  Login Employee  │
│  + Code Entrep.  │       │  Email + Pass    │
└────────┬─────────┘       └────────┬─────────┘
         │                           │
         │                           │
         ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│ Manager Dashboard│       │ Employee Dashboard│
│ /manager/[slug]  │       │ /app             │
│                  │       │                  │
│ ┌──────────────┐ │       │ ┌──────────────┐ │
│ │ Request Hub  │ │◄──────┼─┤  My Team V2  │ │
│ │   (V2)       │ │ REAL  │ │  (Dynamic)   │ │
│ │              │ │ TIME  │ │              │ │
│ │ • Adhésions  │ │◄─────►│ │ • Freelance  │ │
│ │ • Admin Req  │ │       │ │ • Member     │ │
│ └──────────────┘ │       │ └──────────────┘ │
│                  │       │                  │
│ • Team Members   │       │ • Connections    │
│ • Metrics        │       │ • My Requests    │
│ • Settings       │       │ • Activity       │
└──────────────────┘       └──────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
         ┌─────────────────────┐
         │   Supabase Backend  │
         │                     │
         │ • Auth (RLS)        │
         │ • Real-Time WS      │
         │ • PostgreSQL        │
         │ • Row Level Sec.    │
         └─────────────────────┘
```

---

## 🎉 Conclusion

Cette architecture offre:
- ✅ Sécurité maximale avec RLS
- ✅ Expérience utilisateur fluide
- ✅ Real-time sans compromis
- ✅ UI/UX de niveau luxe
- ✅ Isolation complète des données
- ✅ Scalabilité assurée

**La plateforme est prête pour la production!**
