# Guide de Test des Interactions Employé-Manager

Ce guide vous explique comment tester le flux complet des demandes d'adhésion entre employés et managers.

## Configuration Actuelle

### Équipes Disponibles (14 équipes)

Toutes ces équipes sont maintenant configurées et prêtes à recevoir des demandes:

1. **Comptabilité** (code: `COMPTABILITE`)
2. **Design** (code: `DESIGN`)
3. **Développement** (code: `DEVELOPPEMENT`)
4. **Finance** (code: `COMPTABILITE`)
5. **Flux.AI Demo Company** (code: `FLUX2024`)
6. **IT Support** (code: `IT`)
7. **Juridique** (code: `JURIDIQUE`)
8. **Logistique** (code: `LOGISTIQUE`)
9. **Marketing** (code: `MARKETING`)
10. **Opérations** (code: `OPERATIONS`)
11. **Product** (code: N/A - équipe interne)
12. **Ressources Humaines** (code: `RH`)
13. **Support Client** (code: N/A - équipe interne)
14. **Ventes** (code: `VENTES`)

## Scénario de Test Complet

### Étape 1: Créer un Compte Manager

1. Allez sur la page de connexion
2. Cliquez sur **"Accéder à l'Espace Manager"**
3. Cliquez sur **"Pas encore inscrit ? Créer un compte"**
4. Remplissez le formulaire:
   - **Code Entreprise**: `RH` (ou n'importe quel code de la liste)
   - **Nom complet**: Marie Dupont
   - **Email**: marie.dupont@company.com
   - **Mot de passe**: password123
5. Cliquez sur **"Créer Compte Manager"**

✅ **Résultat attendu**: Vous êtes redirigé vers le tableau de bord manager

### Étape 2: Créer un Compte Employé

1. Déconnectez-vous (ou utilisez un navigateur en mode privé)
2. Allez sur la page de connexion
3. Cliquez sur **"Accéder à l'Espace Employé"**
4. Cliquez sur **"Pas encore inscrit ? Créer un compte"**
5. Remplissez le formulaire:
   - **Nom complet**: Jean Martin
   - **Email**: jean.martin@company.com
   - **Mot de passe**: password123
6. Cliquez sur **"Créer Compte Employé"**

✅ **Résultat attendu**: Vous êtes redirigé vers le tableau de bord employé

### Étape 3: Envoyer une Demande d'Adhésion (Employé)

1. Dans le menu latéral, cliquez sur **"Mon Équipe"**
2. Cliquez sur le bouton **"Demander à Rejoindre une Équipe"**
3. Dans le modal qui s'ouvre:
   - **Sélectionnez** l'équipe "Ressources Humaines" (ou celle que vous avez créée)
   - **Écrivez un message**: "Je souhaite rejoindre votre équipe pour contribuer aux projets RH"
4. Cliquez sur **"Envoyer"**

✅ **Résultat attendu**:
- Message de succès "Demande d'adhésion envoyée avec succès!"
- La demande apparaît dans la liste "Mes Demandes d'Adhésion" avec le statut "En attente"

### Étape 4: Vérifier la Demande (Manager)

1. Connectez-vous avec le compte manager (marie.dupont@company.com)
2. Dans le menu latéral, cliquez sur **"Centre des Requêtes"**
3. Allez dans l'onglet **"Demandes d'Adhésion"**

✅ **Résultat attendu**:
- Vous voyez la demande de Jean Martin
- Vous pouvez voir son nom, email, et message de motivation
- Deux boutons sont disponibles: "Approuver" et "Refuser"

### Étape 5: Approuver la Demande (Manager)

1. Cliquez sur le bouton **"Approuver"** pour la demande de Jean Martin
2. Confirmez l'approbation

✅ **Résultat attendu**:
- Message de succès
- La demande passe au statut "Approuvée"
- Jean Martin est automatiquement ajouté à l'équipe Ressources Humaines

### Étape 6: Vérifier l'Adhésion (Employé)

1. Reconnectez-vous avec le compte employé (jean.martin@company.com)
2. Allez dans **"Mon Équipe"**

✅ **Résultat attendu**:
- Vous voyez maintenant "Ressources Humaines" comme votre équipe actuelle
- Vous apparaissez dans la liste des membres de l'équipe
- La demande dans "Mes Demandes d'Adhésion" affiche le statut "Approuvée"

## Scénario de Test: Refus de Demande

### Étape 1: Envoyer une Nouvelle Demande

1. Avec le compte employé, envoyez une autre demande pour une équipe différente (ex: Marketing)

### Étape 2: Refuser la Demande

1. Connectez-vous avec un manager de l'équipe Marketing
2. Allez dans **"Centre des Requêtes"** > **"Demandes d'Adhésion"**
3. Cliquez sur **"Refuser"**
4. Ajoutez un commentaire optionnel: "Nous recherchons actuellement un profil différent"
5. Confirmez le refus

✅ **Résultat attendu**:
- La demande passe au statut "Refusée"
- L'employé peut voir le statut et le commentaire du manager

## Tests Multiples Équipes

Pour tester avec plusieurs managers:

1. Créez plusieurs comptes managers avec différents codes:
   - Manager IT: `IT` / it.manager@company.com
   - Manager Ventes: `VENTES` / ventes.manager@company.com
   - Manager Design: `DESIGN` / design.manager@company.com

2. Créez plusieurs comptes employés

3. Testez que:
   - Chaque manager ne voit QUE les demandes pour SON équipe
   - Les employés peuvent envoyer des demandes à n'importe quelle équipe
   - Les notifications fonctionnent correctement

## Vérifications Importantes

### Isolation des Données

✅ Un manager de l'équipe Marketing ne doit PAS voir:
- Les demandes d'adhésion pour l'équipe RH
- Les membres de l'équipe Finance
- Les requêtes d'une autre équipe

### Permissions Employé

✅ Un employé doit pouvoir:
- Voir toutes les équipes disponibles
- Envoyer des demandes à n'importe quelle équipe
- Voir le statut de toutes ses demandes
- Voir les membres de son équipe une fois accepté

### Notifications

✅ Les notifications doivent apparaître:
- Quand un employé envoie une demande (confirmation)
- Quand un manager reçoit une nouvelle demande
- Quand une demande est approuvée/refusée

## Dépannage

### Problème: Le manager ne voit pas les demandes

**Vérifications**:
1. Le manager est-il bien connecté avec le bon code d'entreprise?
2. La demande a-t-elle été envoyée pour la bonne équipe?
3. Rafraîchir la page

### Problème: L'employé ne voit pas toutes les équipes

**Vérifications**:
1. Rafraîchir la page
2. Vérifier la console du navigateur pour les erreurs
3. S'assurer que l'employé n'est pas déjà membre de certaines équipes

### Problème: Erreur lors de l'approbation

**Vérifications**:
1. Le manager a-t-il les permissions appropriées?
2. L'employé existe-t-il toujours dans le système?
3. Vérifier les logs dans la console

## Support Technique

Si vous rencontrez des problèmes non listés ici:
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs en rouge
3. Vérifiez les requêtes réseau dans l'onglet "Network"
4. Contactez le support avec les détails de l'erreur
