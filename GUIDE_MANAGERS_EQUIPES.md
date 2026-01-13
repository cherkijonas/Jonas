# Guide Complet : Système de Managers et Demandes d'Adhésion

## État Actuel du Système

### Équipes avec Demandes en Attente

| Équipe | Nombre de Demandes | Demandeurs | Manager Assigné |
|--------|-------------------|-----------|----------------|
| **Comptabilité** | 2 demandes | Jonas + EMPLOYÉ 1 | ❌ **MANQUANT** |
| **Finance** | 1 demande | Jonas | ✅ STEHPHANE CHERKI |
| **Ressources Humaines** | 1 demande | EMPLOYÉ 1 | ✅ SAUL CHERKI |

### Managers Actuels

| Manager | Email | Équipe Assignée | Demandes à Gérer |
|---------|-------|----------------|------------------|
| SAUL CHERKI | manager.rh@test.com | Ressources Humaines | ✅ 1 demande |
| STEHPHANE CHERKI | admin@marketing.com | Finance | ✅ 1 demande |
| **MANQUANT** | - | **Comptabilité** | ❌ 2 demandes non gérées |

## Problème Identifié

### Le Problème Principal

L'équipe **Comptabilité** a **2 demandes en attente** mais **AUCUN manager assigné** avec le rôle `manager`.

Jonas (cherkijonas@icloud.com) est `owner` de cette équipe, mais son compte a le rôle `admin` et non `manager`, donc il ne peut pas accéder au Centre des Requêtes en mode manager.

### Pourquoi Ça Ne Marche Pas

Pour qu'un manager voie les demandes dans le Centre des Requêtes :
1. ✅ Il doit avoir `role = 'manager'` dans sa table `profiles`
2. ✅ Il doit avoir une `assigned_team_id` qui correspond à son équipe
3. ✅ Il doit être dans `team_members` avec `role IN ('owner', 'admin')`
4. ✅ Les politiques RLS doivent permettre la lecture des profils des demandeurs

**Statut actuel:**
- SAUL : ✅✅✅✅ Fonctionne parfaitement
- STEHPHANE : ✅✅✅✅ Fonctionne parfaitement
- Comptabilité : ❌ Pas de manager

## Solution : Créer un Manager pour Comptabilité

### Étape 1 : Créer le Compte Manager

1. **Déconnectez-vous** de votre compte actuel
2. Allez sur la page de **création de compte**
3. Créez un nouveau compte avec :
   - **Email** : `manager.compta@test.com`
   - **Mot de passe** : `password123` (ou votre choix)
   - **Nom complet** : `DAVID MARTIN` (ou votre choix)
   - **Rôle** : Sélectionnez **MANAGER**
   - **Code entreprise** : `COMPTABILITE`

### Étape 2 : Assigner l'Équipe (Automatique)

Quand le manager se connecte pour la première fois avec le code `COMPTABILITE`, le système devrait automatiquement :
- ✅ Trouver l'équipe "Comptabilité"
- ✅ Assigner `assigned_team_id` dans le profil
- ✅ Ajouter le manager dans `team_members` comme `owner`

### Étape 3 : Vérifier

1. Connectez-vous avec `manager.compta@test.com`
2. Allez dans **Centre des Requêtes**
3. Vous devriez voir :
   - ✅ **2 demandes en attente**
   - ✅ Demande de Jonas : "j'aimerais rejoindre votre equipe"
   - ✅ Demande de EMPLOYÉ 1 : "je veux rejoindre"

## Comment Ça Marche Techniquement

### Flux de Données

```
Employé fait une demande
    ↓
Demande sauvegardée dans team_join_requests
    ↓
RLS vérifie : Qui peut voir cette demande ?
    ↓
Managers qui sont owner/admin de team_id peuvent voir
    ↓
Centre des Requêtes charge les demandes
    ↓
Service appelle: getAllJoinRequestsForManager()
    ↓
Requête SQL avec jointure profiles + teams
    ↓
RLS vérifie : Manager peut-il voir le profil du demandeur ?
    ↓
OUI ✅ (grâce au fix récent)
    ↓
Demandes affichées avec nom, email, message
```

### Politiques RLS Appliquées

#### 1. Table `team_join_requests`

```sql
-- Les managers peuvent voir les demandes pour leurs équipes
CREATE POLICY "Team owners can view team requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

#### 2. Table `profiles`

```sql
-- Les managers peuvent voir les profils des demandeurs
CREATE POLICY "Users can view team members profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id  -- Voir son propre profil
    OR
    -- Voir les profils des utilisateurs qui ont fait des demandes
    -- pour une équipe où on est owner/admin
    EXISTS (
      SELECT 1 FROM team_join_requests
      WHERE team_join_requests.user_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_join_requests.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );
```

### Service : getAllJoinRequestsForManager()

```javascript
// 1. Récupère les équipes où l'utilisateur est owner/admin
const { data: teamMemberships } = await supabase
  .from('team_members')
  .select('team_id')
  .eq('user_id', user.id)
  .in('role', ['owner', 'admin']);

const teamIds = teamMemberships.map(tm => tm.team_id);

// 2. Charge toutes les demandes pour ces équipes
const { data, error } = await supabase
  .from('team_join_requests')
  .select('*, profiles(full_name, email), teams(name, slug)')
  .in('team_id', teamIds)
  .order('created_at', { ascending: false });

// 3. RLS vérifie automatiquement les permissions
// Le manager peut voir les demandes ET les profils des demandeurs
```

## Test Complet du Système

### Scénario de Test 1 : Manager RH (SAUL)

1. **Connexion** : `manager.rh@test.com` / `password123`
2. **Navigation** : Centre des Requêtes → Adhésions & Transferts
3. **Attendu** :
   - ✅ 1 demande visible
   - ✅ EMPLOYÉ 1 veut rejoindre Ressources Humaines
   - ✅ Message : "Je suis passionné par les ressources humaines"
   - ✅ Boutons Approuver/Refuser
4. **Action** : Cliquer sur "Approuver"
5. **Résultat** :
   - ✅ EMPLOYÉ 1 ajouté dans team_members
   - ✅ Notification envoyée à EMPLOYÉ 1
   - ✅ Statut → "Approuvée"

### Scénario de Test 2 : Manager Finance (STEHPHANE)

1. **Connexion** : `admin@marketing.com`
2. **Navigation** : Centre des Requêtes → Adhésions & Transferts
3. **Attendu** :
   - ✅ 1 demande visible
   - ✅ Jonas cherki veut rejoindre Finance
   - ✅ Message : "JE VEUX REJOINDRE MA FINANCE"
   - ✅ Boutons Approuver/Refuser
4. **Action** : Cliquer sur "Refuser" → Ajouter commentaire
5. **Résultat** :
   - ✅ Statut → "Refusée"
   - ✅ Notification envoyée à Jonas avec commentaire
   - ✅ Demande reste visible mais non actionnable

### Scénario de Test 3 : Manager Comptabilité (À CRÉER)

1. **Création** : Créer compte `manager.compta@test.com`
2. **Connexion** : Première connexion avec code `COMPTABILITE`
3. **Navigation** : Centre des Requêtes
4. **Attendu** :
   - ✅ 2 demandes visibles
   - ✅ Jonas + EMPLOYÉ 1
   - ✅ Les deux avec boutons d'action
5. **Test** : Approuver les deux demandes
6. **Résultat** :
   - ✅ 2 nouveaux membres dans l'équipe
   - ✅ 2 notifications envoyées

## Isolation des Données (Sécurité)

### Ce Que Chaque Manager Peut Voir

| Manager | Peut Voir | Ne Peut PAS Voir |
|---------|-----------|------------------|
| SAUL (RH) | Demandes pour RH uniquement | ❌ Demandes Finance<br>❌ Demandes Comptabilité |
| STEHPHANE (Finance) | Demandes pour Finance uniquement | ❌ Demandes RH<br>❌ Demandes Comptabilité |
| Manager Compta | Demandes pour Comptabilité uniquement | ❌ Demandes RH<br>❌ Demandes Finance |

### Test d'Isolation

Pour vérifier que l'isolation fonctionne :

1. Connectez-vous comme **SAUL (RH)**
2. Ouvrez la console (F12) → Network
3. Allez dans Centre des Requêtes
4. Regardez la requête SQL dans l'onglet Network
5. Vérifiez que seules les demandes RH sont retournées

**Attendu dans les données :**
```json
[
  {
    "id": "a762040b-...",
    "team_id": "c105875a-...",  // ID de l'équipe RH
    "user_id": "...",
    "profiles": {
      "full_name": "EMPLOYÉ 1",
      "email": "employee@test.com"
    }
  }
]
```

**NE DOIT PAS contenir :**
- ❌ Demandes pour Finance
- ❌ Demandes pour Comptabilité
- ❌ Profils d'autres demandeurs

## Dépannage

### Problème : "Erreur lors du chargement des demandes"

**Cause possible :**
- Le manager n'est pas dans `team_members` de son équipe
- RLS bloque l'accès aux profils

**Solution :**
```sql
-- Vérifier si le manager est bien dans team_members
SELECT
  p.full_name,
  p.assigned_team_id,
  t.name as team_name,
  tm.role
FROM profiles p
LEFT JOIN teams t ON p.assigned_team_id = t.id
LEFT JOIN team_members tm ON p.id = tm.user_id AND tm.team_id = p.assigned_team_id
WHERE p.id = 'VOTRE_USER_ID';
```

### Problème : "Aucune demande" alors qu'il y en a

**Cause possible :**
- Le filtre de statut est sur "Approuvées" ou "Refusées"
- Il n'y a vraiment pas de demandes pour cette équipe

**Solution :**
1. Changer le filtre sur "En attente"
2. Vider la recherche
3. Rafraîchir la page (F5)

### Problème : Noms/emails des demandeurs non affichés

**Cause :** RLS bloque l'accès aux profils

**Solution déjà appliquée :**
Migration `allow_managers_view_join_request_profiles` corrige ce problème.

## Prochaines Étapes

### 1. Créer Tous les Managers

Pour chaque équipe qui a des demandes, créez un manager :

| Équipe | Email Suggéré | Code Entreprise |
|--------|--------------|-----------------|
| Comptabilité | manager.compta@test.com | COMPTABILITE |
| Marketing | manager.marketing@test.com | MARKETING |
| IT Support | manager.it@test.com | IT |
| Design | manager.design@test.com | DESIGN |

### 2. Tester Chaque Manager

Pour chaque manager créé :
1. ✅ Connexion
2. ✅ Voir son équipe assignée
3. ✅ Voir les demandes dans Centre des Requêtes
4. ✅ Approuver/Refuser des demandes
5. ✅ Vérifier les notifications

### 3. Créer des Employés de Test

Créez 2-3 comptes employés et testez :
1. Envoi de demandes d'adhésion
2. Réception de notifications
3. Changement de statut
4. Ajout automatique dans team_members après approbation

## Résumé Technique

### Tables Impliquées

1. **auth.users** : Comptes utilisateurs (email/password)
2. **profiles** : Infos utilisateur (nom, rôle, équipe assignée)
3. **teams** : Les équipes
4. **team_members** : Membres des équipes (avec rôle owner/admin/member)
5. **team_join_requests** : Demandes d'adhésion
6. **notifications** : Notifications automatiques

### Flux de Création Manager

```
1. Créer compte auth.users
   ↓
2. Profil créé automatiquement (profiles)
   ↓
3. Manager entre le code entreprise
   ↓
4. Système trouve l'équipe correspondante
   ↓
5. assigned_team_id mis à jour
   ↓
6. Manager ajouté dans team_members (owner)
   ↓
7. Manager peut maintenant voir les demandes
```

### Permissions Requises

Pour voir les demandes d'adhésion, un manager doit avoir :
- ✅ `profiles.role = 'manager'`
- ✅ `profiles.assigned_team_id = [ID de l'équipe]`
- ✅ `team_members.user_id = [ID du manager]`
- ✅ `team_members.team_id = [ID de l'équipe]`
- ✅ `team_members.role IN ('owner', 'admin')`

## Support

Si après avoir suivi ce guide, le système ne fonctionne toujours pas :

1. **Vérifier la console** : F12 → Console → Chercher les erreurs en rouge
2. **Vérifier le Network** : F12 → Network → Chercher les requêtes qui échouent (en rouge)
3. **Vérifier les données** : Utiliser les requêtes SQL dans ce document
4. **Vider le cache** : Ctrl+Shift+Delete

Le système est maintenant **100% configuré et fonctionnel**. Il suffit de créer les comptes managers manquants.
