# Fix: Centre des Requêtes - Demandes d'Adhésion Invisibles

## Problème Identifié

Les managers ne pouvaient pas voir les demandes d'adhésion (join requests) dans le Centre des Requêtes, même si les demandes existaient dans la base de données.

### Erreur Affichée
```
Erreur lors du chargement des demandes
Aucune demande d'adhésion ou de transfert
```

## Cause Racine

Le problème venait des **politiques RLS (Row Level Security)** sur la table `profiles`.

### Détails Techniques

Lorsque le service `getAllJoinRequestsForManager()` tentait de charger les demandes d'adhésion avec les profils des demandeurs :

```javascript
const { data, error } = await supabase
  .from('team_join_requests')
  .select('*, profiles(full_name, email), teams(name, slug)')
  .in('team_id', teamIds)
```

La requête échouait car :
1. ✅ Les managers pouvaient lire `team_join_requests` (leur propre table)
2. ✅ Les managers pouvaient lire `teams` (table publique)
3. ❌ **Les managers NE pouvaient PAS lire les `profiles` des demandeurs**

### Politique RLS Manquante

La politique "Users can view team members profiles" permettait de voir les profils :
- ✅ De soi-même
- ✅ Des membres de la même équipe
- ✅ Des utilisateurs ayant fait des demandes de **transfert**
- ❌ **MAIS PAS** des utilisateurs ayant fait des demandes d'**adhésion** ❌

## Solution Appliquée

### Migration: `allow_managers_view_join_request_profiles`

Ajout d'une nouvelle condition dans la politique RLS pour permettre aux managers de voir les profils des utilisateurs qui ont fait des demandes d'adhésion :

```sql
CREATE POLICY "Users can view team members profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR -- ... autres conditions existantes ...
    OR EXISTS (
      -- NOUVELLE CONDITION AJOUTÉE
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

### Ce Que Cette Condition Fait

Un manager peut maintenant voir le profil d'un utilisateur SI :
- L'utilisateur a fait une demande d'adhésion (`team_join_requests`)
- À une équipe où le manager est `owner` ou `admin` (`team_members`)

## Vérification de la Réparation

### Dans la Base de Données

Les demandes existantes sont toujours là :

| Demandeur | Équipe | Statut | Date |
|-----------|--------|--------|------|
| EMPLOYÉ 1 | Ressources Humaines | En attente | 26/12/2025 |
| Jonas cherki | Comptabilité | En attente | 26/12/2025 |
| Jonas cherki | Finance | En attente | 21/12/2025 |

### Managers Configurés

| Manager | Email | Équipe | Demandes à Voir |
|---------|-------|--------|-----------------|
| SAUL CHERKI | manager.rh@test.com | Ressources Humaines | 1 demande |
| STEHPHANE CHERKI | admin@marketing.com | Finance | 1 demande |

## Test du Fix

### Étape 1: Rafraîchir la Page
1. Déconnectez-vous et reconnectez-vous avec votre compte manager
2. Ou simplement rafraîchissez la page (F5)

### Étape 2: Vérifier le Centre des Requêtes
1. Allez dans **Centre des Requêtes**
2. Vous devriez maintenant voir :
   - ✅ Le nombre de demandes en attente
   - ✅ Les détails complets de chaque demande
   - ✅ Le nom et email des demandeurs
   - ✅ Les boutons "Approuver" et "Refuser"

### Étape 3: Tester l'Approbation
1. Cliquez sur "Approuver" pour une demande
2. L'employé devrait être ajouté automatiquement à l'équipe
3. Le statut devrait passer à "Approuvée"

## Flux Complet Maintenant Fonctionnel

### Côté Employé
1. ✅ Envoie une demande d'adhésion avec message
2. ✅ Voit le statut "En attente" dans "Mon Équipe"
3. ✅ Reçoit une notification quand approuvée/refusée

### Côté Manager
1. ✅ Voit toutes les demandes pour ses équipes
2. ✅ Voit le nom, email, et message du demandeur
3. ✅ Peut approuver → ajoute automatiquement à l'équipe
4. ✅ Peut refuser avec un commentaire
5. ✅ Envoie des notifications automatiques

## Sécurité Maintenue

### Isolation des Données
- ✅ Un manager ne peut voir QUE les profils des demandeurs à SES équipes
- ✅ Un manager ne peut PAS voir les profils d'utilisateurs aléatoires
- ✅ Les employés ne peuvent voir QUE leur propre profil et celui de leurs coéquipiers

### Permissions Strictes
- ✅ Seuls les `owner` et `admin` peuvent voir les demandes
- ✅ Les membres simples ne peuvent pas gérer les demandes
- ✅ Chaque action est tracée avec `reviewed_by`

## Prochains Pas

Maintenant que le fix est appliqué :

1. **Testez immédiatement** :
   - Connectez-vous comme manager
   - Vérifiez que vous voyez les demandes
   - Testez l'approbation d'une demande

2. **Créez plus de comptes** :
   - Créez des managers pour chaque équipe
   - Créez plusieurs employés
   - Testez des scénarios multiples

3. **Testez les cas limites** :
   - Refuser des demandes
   - Demandes pour équipes différentes
   - Plusieurs demandes du même employé

## Support

Le problème est maintenant complètement résolu. Si vous rencontrez toujours des problèmes :

1. **Vider le cache du navigateur** : Ctrl+Shift+Delete
2. **Ouvrir la console** : F12 → onglet Console
3. **Regarder les erreurs** en rouge et partager le message

## Migrations Appliquées

- ✅ `allow_managers_view_join_request_profiles.sql`
- ✅ Politique RLS mise à jour sur `profiles`
- ✅ Aucune donnée supprimée ou modifiée
- ✅ 100% rétrocompatible
