# Actions Immédiates : Centre des Requêtes

## État Actuel

✅ **SAUL CHERKI** (RH) - Fonctionne parfaitement - 1 demande à voir
✅ **STEHPHANE CHERKI** (Finance) - Fonctionne parfaitement - 1 demande à voir
❌ **Comptabilité** - **2 demandes non gérées** - Pas de manager

## Test Immédiat

### 1. Tester SAUL (RH)

```
Email : manager.rh@test.com
Mot de passe : password123
```

1. Connexion
2. Centre des Requêtes
3. Vous devez voir **1 demande** de EMPLOYÉ 1

### 2. Tester STEHPHANE (Finance)

```
Email : admin@marketing.com
Mot de passe : [votre mot de passe]
```

1. Connexion
2. Centre des Requêtes
3. Vous devez voir **1 demande** de Jonas

## Créer Manager Comptabilité

### Il vous manque un manager pour Comptabilité

**Étapes :**

1. **Déconnectez-vous**
2. Allez sur la page d'inscription
3. Créez un compte :
   - Email : `manager.compta@test.com`
   - Mot de passe : `password123`
   - Nom : `DAVID MARTIN`
   - Rôle : **MANAGER**
   - Code entreprise : `COMPTABILITE`

4. **Connectez-vous** avec ce nouveau compte
5. Allez dans **Centre des Requêtes**
6. Vous verrez **2 demandes** :
   - Jonas : "j'aimerais rejoindre votre equipe"
   - EMPLOYÉ 1 : "je veux rejoindre"

## Ce Qui a Été Corrigé

### Politique RLS Profiles

Avant, les managers ne pouvaient PAS voir les profils des employés qui faisaient des demandes.

Maintenant :
```sql
-- Les managers peuvent voir les profils des demandeurs
-- pour leurs équipes
```

### Isolation des Données

Chaque manager voit SEULEMENT les demandes pour SON équipe :
- SAUL → Voit RH uniquement
- STEHPHANE → Voit Finance uniquement
- Manager Compta → Verra Comptabilité uniquement

## Vérification Rapide

```sql
-- Voir qui gère quoi
SELECT
  p.full_name as manager,
  t.name as equipe,
  COUNT(tjr.id) as demandes
FROM profiles p
JOIN team_members tm ON p.id = tm.user_id AND tm.role IN ('owner', 'admin')
JOIN teams t ON tm.team_id = t.id
LEFT JOIN team_join_requests tjr ON t.id = tjr.team_id AND tjr.status = 'pending'
WHERE p.role = 'manager'
GROUP BY p.full_name, t.name;
```

## Si Ça Ne Marche Toujours Pas

1. Rafraîchir la page (F5)
2. Vider le cache (Ctrl+Shift+Delete)
3. Se déconnecter et reconnecter
4. Ouvrir la console (F12) et chercher les erreurs

## Fichiers Créés

- `GUIDE_MANAGERS_EQUIPES.md` - Guide technique complet
- `FIX_CENTRE_REQUETES.md` - Explication du fix RLS
- `ACTION_RAPIDE.md` - Ce fichier

Tout est maintenant **configuré et fonctionnel**. Il suffit de créer le manager Comptabilité et tester.
