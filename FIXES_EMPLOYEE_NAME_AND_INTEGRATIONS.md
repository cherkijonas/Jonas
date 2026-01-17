# Correctifs: Nom Employé & Connexion Outils
**Date**: 28 Décembre 2024

## ✅ Problèmes Résolus

### 1. Affichage du Nom de l'Employé

**Problème**: Affichait "Bonjour, Utilisateur.." au lieu du vrai nom de l'employé

**Solution**: Amélioration de la logique de chargement du nom dans GlobalContext

```typescript
const displayName = profile.full_name ||
                   user.user_metadata?.full_name ||
                   user.email?.split('@')[0] ||
                   'Utilisateur';
```

**Ordre de priorité**:
1. `profile.full_name` (depuis table profiles)
2. `user.user_metadata?.full_name` (depuis auth.users)
3. Partie avant @ de l'email (ex: "sophie.martin" depuis "sophie.martin@flux.ai")
4. Fallback "Utilisateur" si rien d'autre

**Résultat**:
- TopBar affiche maintenant: "Bonjour, Sophie. Santé de l'Agence: Bon"
- Nom correct chargé depuis la base de données

---

### 2. Connexion des Outils

**Problème**: Cliquer sur un outil ne le connectait pas

**Cause**: Conflits entre plusieurs policies RLS sur la table `integrations`

**Solution**: Nettoyage complet et création de policies claires

#### Migration Appliquée: `fix_integrations_rls_for_all_users`

**Supprimé**:
- Toutes les anciennes policies (9 policies conflictuelles)

**Créé**:
4 nouvelles policies simples et claires:

1. **Allow SELECT integrations**
   - Utilisateurs voient leurs intégrations personnelles (user_id = auth.uid(), team_id = NULL)
   - Membres d'équipe voient les intégrations de leur équipe

2. **Allow INSERT integrations**
   - Employés peuvent créer des intégrations personnelles
   - Managers peuvent créer des intégrations d'équipe
   - Owners/Admins peuvent créer des intégrations d'équipe

3. **Allow UPDATE integrations**
   - Utilisateurs peuvent mettre à jour leurs intégrations personnelles
   - Managers peuvent mettre à jour les intégrations de leur équipe
   - Owners/Admins peuvent mettre à jour les intégrations d'équipe

4. **Allow DELETE integrations**
   - Utilisateurs peuvent supprimer leurs intégrations personnelles
   - Managers peuvent supprimer les intégrations de leur équipe
   - Owners/Admins peuvent supprimer les intégrations d'équipe

---

## 📝 Fichiers Modifiés

### GlobalContext.tsx

**Chargement du profil utilisateur** (lignes 101-125):
```typescript
useEffect(() => {
  if (user && profile) {
    const displayName = profile.full_name ||
                       user.user_metadata?.full_name ||
                       user.email?.split('@')[0] ||
                       'Utilisateur';

    setUserProfile({
      name: displayName,
      email: user.email || '',
      role: profile.role === 'manager' ? 'Manager' : 'Employee',
      language: 'fr',
      timezone: 'Europe/Paris (GMT+1)',
    });
    setIsAuthenticated(true);

    console.log('User profile loaded:', {
      name: displayName,
      email: user.email,
      role: profile.role
    });
  } else {
    setIsAuthenticated(false);
  }
}, [user, profile]);
```

**Toggle Integration amélioré** (lignes 315-371):
```typescript
const toggleIntegration = async (id: string) => {
  setConnectingIntegrationId(id);

  if (!user) {
    console.error('No user logged in');
    setConnectingIntegrationId(null);
    return;
  }

  try {
    const integration = enterpriseIntegrations.find(int => int.id === id);
    if (!integration) {
      console.error('Integration not found:', id);
      setConnectingIntegrationId(null);
      return;
    }

    console.log('Toggling integration:', {
      integrationName: integration.name,
      teamId,
      userId: user.id
    });

    const existing = await integrationsService.getIntegrationByTool(
      integration.name,
      teamId,
      user.id
    );

    console.log('Existing integration:', existing);

    if (existing && existing.status === 'connected') {
      console.log('Disconnecting integration...');
      await integrationsService.disconnectIntegration(
        integration.name,
        teamId,
        user.id
      );
      if (teamId) {
        await activityService.logActivity(
          teamId,
          user.id,
          'disconnected',
          'integration',
          existing.id,
          { tool_name: integration.name }
        );
      }
    } else {
      console.log('Connecting integration...');
      const result = await integrationsService.connectIntegration(
        integration.name,
        {},
        teamId,
        user.id
      );
      console.log('Integration connected:', result);

      if (teamId) {
        await activityService.logActivity(
          teamId,
          user.id,
          'connected',
          'integration',
          null,
          { tool_name: integration.name }
        );
      }
    }

    await loadIntegrations();
  } catch (error) {
    console.error('Error toggling integration:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }

  setConnectingIntegrationId(null);
};
```

**Logs ajoutés**:
- Log au chargement du profil
- Logs au chargement des intégrations
- Logs détaillés lors du toggle d'une intégration
- Logs d'erreur avec détails

---

## 🎯 Scénarios Testés

### Employé Sans Équipe

**Contexte**:
- User connecté
- `profile.role = 'employee'`
- `profile.assigned_team_id = NULL`
- Aucun `team_members` record

**Comportement**:
1. Nom affiché correctement: "Bonjour, [Prénom]"
2. Peut connecter des outils personnels
3. Intégrations créées avec:
   - `user_id = auth.uid()`
   - `team_id = NULL`
4. Les intégrations sont visibles uniquement par cet utilisateur

**Exemple**:
```
Sophie Martin se connecte
→ TopBar: "Bonjour, Sophie"
→ Va sur /app/connections
→ Clique sur "Slack"
→ INSERT dans integrations:
  {
    tool_name: 'Slack',
    user_id: 'xxx-xxx-xxx',
    team_id: null,
    status: 'connected'
  }
→ Outil apparaît connecté
→ Health score monte à 50
```

---

### Employé Dans une Équipe

**Contexte**:
- User connecté
- `profile.role = 'employee'`
- Record dans `team_members` (role = 'member')

**Comportement**:
1. Nom affiché correctement: "Bonjour, [Prénom]"
2. Peut connecter des outils personnels (user_id, team_id = NULL)
3. Peut voir les intégrations de son équipe (SELECT)
4. Ne peut PAS créer/modifier les intégrations d'équipe (réservé aux managers/owners)

**Exemple**:
```
Thomas Bernard (membre de Finance) se connecte
→ TopBar: "Bonjour, Thomas"
→ Va sur /app/connections
→ Voit les intégrations d'équipe (Jira, Slack) en lecture seule
→ Peut connecter ses outils personnels (Excel, Gmail)
```

---

### Manager d'Équipe

**Contexte**:
- User connecté
- `profile.role = 'manager'`
- `profile.assigned_team_id = 'xxx'`

**Comportement**:
1. Nom affiché correctement: "Bonjour, [Prénom]"
2. Peut connecter des outils personnels (user_id, team_id = NULL)
3. Peut créer/modifier les intégrations de son équipe (team_id = assigned_team_id)
4. Voit toutes les intégrations de son équipe

**Exemple**:
```
Marie Lambert (Manager Operations) se connecte
→ TopBar: "Bonjour, Marie"
→ Va sur /app/connections
→ Peut connecter des outils pour l'équipe Operations:
  INSERT avec team_id = 'operations-team-id'
→ Peut aussi connecter des outils personnels
```

---

## 🔍 Console Logs Disponibles

Pour debugger, ouvrir la console browser:

**Au chargement**:
```
User profile loaded: {
  name: "Sophie Martin",
  email: "sophie.martin@flux.ai",
  role: "employee"
}

Integrations loaded: [
  { tool_name: 'Slack', status: 'connected', ... }
]
```

**Lors d'un toggle**:
```
Toggling integration: {
  integrationName: "Jira",
  teamId: null,
  userId: "xxx-xxx-xxx"
}

Existing integration: null

Connecting integration...

Integration connected: {
  id: "yyy-yyy-yyy",
  tool_name: "Jira",
  user_id: "xxx-xxx-xxx",
  team_id: null,
  status: "connected"
}

Integrations loaded: [
  { tool_name: 'Slack', status: 'connected', ... },
  { tool_name: 'Jira', status: 'connected', ... }
]
```

**En cas d'erreur**:
```
Error toggling integration: Error: new row violates row-level security policy
Error details: new row violates row-level security policy
```

---

## 🔒 Sécurité RLS

### Intégrations Personnelles

**Policy**: `Allow INSERT integrations`

**Condition**:
```sql
user_id = auth.uid() AND team_id IS NULL
```

**Test**:
```sql
-- Doit réussir
INSERT INTO integrations (tool_name, user_id, team_id, status)
VALUES ('Slack', auth.uid(), NULL, 'connected');

-- Doit échouer
INSERT INTO integrations (tool_name, user_id, team_id, status)
VALUES ('Slack', 'autre-user-id', NULL, 'connected');
```

---

### Intégrations d'Équipe

**Policy**: `Allow INSERT integrations`

**Condition (Manager)**:
```sql
team_id IS NOT NULL
AND EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'manager'
  AND profiles.assigned_team_id = integrations.team_id
)
```

**Test**:
```sql
-- Manager peut créer pour son équipe
-- (si profile.assigned_team_id = 'operations-id')
INSERT INTO integrations (tool_name, team_id, status)
VALUES ('Jira', 'operations-id', 'connected');

-- Mais pas pour une autre équipe
-- Doit échouer
INSERT INTO integrations (tool_name, team_id, status)
VALUES ('Jira', 'finance-id', 'connected');
```

---

## ✅ Checklist de Test

### Nom de l'Employé

- [x] Se connecter avec un compte existant
- [x] Vérifier TopBar affiche "Bonjour, [Prénom]" (pas "Utilisateur")
- [x] Vérifier email affiché correctement sous le nom
- [x] Créer un nouveau compte
- [x] Vérifier nom dérivé de l'email si full_name vide

### Connexion Outils - Employé Sans Équipe

- [x] Se connecter en tant qu'employé
- [x] Aller sur /app/connections
- [x] Cliquer sur un outil (ex: Slack)
- [x] Vérifier toggle passe à "Connecté"
- [x] Vérifier dans Supabase: record créé avec user_id et team_id = NULL
- [x] Rafraîchir la page
- [x] Vérifier outil toujours connecté

### Connexion Outils - Manager

- [x] Se connecter en tant que manager
- [x] Aller sur /app/connections
- [x] Cliquer sur un outil pour l'équipe
- [x] Vérifier toggle fonctionne
- [x] Vérifier dans Supabase: record créé avec team_id
- [x] Se connecter en tant que membre de l'équipe
- [x] Vérifier outil visible

### Déconnexion Outils

- [x] Connecter un outil
- [x] Cliquer à nouveau pour déconnecter
- [x] Vérifier status passe à 'disconnected'
- [x] Vérifier outil n'apparaît plus dans connectedTools
- [x] Vérifier health score mis à jour

---

## 📊 Base de Données

### Table `integrations` Structure

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT integrations_team_or_user_check
    CHECK (team_id IS NOT NULL OR user_id IS NOT NULL)
);
```

**Contraintes**:
- Au moins `team_id` OU `user_id` doit être défini
- Index unique sur (user_id, tool_name) pour intégrations personnelles
- Index unique sur (team_id, tool_name) pour intégrations d'équipe

### Exemples de Données

**Intégration Personnelle**:
```json
{
  "id": "aaa-bbb-ccc",
  "tool_name": "Slack",
  "user_id": "sophie-id",
  "team_id": null,
  "status": "connected",
  "config": {},
  "last_sync": "2024-12-28T10:30:00Z"
}
```

**Intégration d'Équipe**:
```json
{
  "id": "xxx-yyy-zzz",
  "tool_name": "Jira",
  "user_id": null,
  "team_id": "operations-id",
  "status": "connected",
  "config": {},
  "last_sync": "2024-12-28T10:30:00Z"
}
```

---

## 🚀 Build Status

```bash
npm run build
✓ 2664 modules transformed
✓ Built in 16.15s
✓ dist/index.html                     0.70 kB
✓ dist/assets/index-x1NuKFKf.css     74.54 kB
✓ dist/assets/index-DbBIM96P.js   1,980.29 kB

Status: ✅ SUCCESS
```

---

**Date**: 28 Décembre 2024
**Status**: ✅ PRODUCTION READY
**Problèmes Résolus**: 2/2
- [x] Nom employé affiché correctement
- [x] Connexion outils fonctionnelle pour tous les utilisateurs
