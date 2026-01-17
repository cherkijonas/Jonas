# 14 Comptes Managers - Configuration Complète

## Base de Données Nettoyée

✅ **3 anciens comptes managers** supprimés (admin@marketing.com, manager.compta@test.com, manager.rh@test.com)
✅ **4 demandes d'adhésion** supprimées
✅ **2 demandes de transfert** supprimées
✅ **0 demande employé**

**Total : Base de données 100% propre - 0 manager - 0 demande**

---

## Les 14 Comptes Managers à Créer

### 1. Comptabilité
```
Nom complet : Sophie Martin
Email : sophie.martin@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : COMPTABILITE
```

### 2. Design
```
Nom complet : Lucas Dubois
Email : lucas.dubois@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : DESIGN
```

### 3. Développement
```
Nom complet : Marie Lambert
Email : marie.lambert@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : DEVELOPPEMENT
```

### 4. Finance
```
Nom complet : Thomas Bernard
Email : thomas.bernard@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : FINANCE
```

### 5. Flux.AI Demo Company
```
Nom complet : Julien Rousseau
Email : julien.rousseau@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : FLUX2024
```

### 6. IT Support
```
Nom complet : Emma Petit
Email : emma.petit@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : IT
```

### 7. Juridique
```
Nom complet : Nicolas Leroy
Email : nicolas.leroy@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : JURIDIQUE
```

### 8. Logistique
```
Nom complet : Camille Moreau
Email : camille.moreau@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : LOGISTIQUE
```

### 9. Marketing
```
Nom complet : Antoine Simon
Email : antoine.simon@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : MARKETING
```

### 10. Opérations
```
Nom complet : Laura Fournier
Email : laura.fournier@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : OPERATIONS
```

### 11. Product
```
Nom complet : Maxime Girard
Email : maxime.girard@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : PRODUCT
```

### 12. Ressources Humaines
```
Nom complet : Sarah Bonnet
Email : sarah.bonnet@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : RH
```

### 13. Support Client
```
Nom complet : Mathieu Dupont
Email : mathieu.dupont@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : SUPPORT
```

### 14. Ventes
```
Nom complet : Léa Garnier
Email : lea.garnier@flux.ai
Mot de passe : Manager2024!
Rôle : MANAGER
Code entreprise : VENTES
```

---

## Tableau Récapitulatif

| # | Équipe | Nom Complet | Email | Code |
|---|--------|-------------|-------|------|
| 1 | Comptabilité | Sophie Martin | sophie.martin@flux.ai | COMPTABILITE |
| 2 | Design | Lucas Dubois | lucas.dubois@flux.ai | DESIGN |
| 3 | Développement | Marie Lambert | marie.lambert@flux.ai | DEVELOPPEMENT |
| 4 | Finance | Thomas Bernard | thomas.bernard@flux.ai | FINANCE |
| 5 | Flux.AI Demo | Julien Rousseau | julien.rousseau@flux.ai | FLUX2024 |
| 6 | IT Support | Emma Petit | emma.petit@flux.ai | IT |
| 7 | Juridique | Nicolas Leroy | nicolas.leroy@flux.ai | JURIDIQUE |
| 8 | Logistique | Camille Moreau | camille.moreau@flux.ai | LOGISTIQUE |
| 9 | Marketing | Antoine Simon | antoine.simon@flux.ai | MARKETING |
| 10 | Opérations | Laura Fournier | laura.fournier@flux.ai | OPERATIONS |
| 11 | Product | Maxime Girard | maxime.girard@flux.ai | PRODUCT |
| 12 | RH | Sarah Bonnet | sarah.bonnet@flux.ai | RH |
| 13 | Support Client | Mathieu Dupont | mathieu.dupont@flux.ai | SUPPORT |
| 14 | Ventes | Léa Garnier | lea.garnier@flux.ai | VENTES |

---

## Procédure de Création

Pour chaque manager :

1. **Déconnectez-vous** de votre compte actuel
2. Allez sur la page **Inscription**
3. Remplissez le formulaire :
   - **Nom complet** : (voir ci-dessus)
   - **Email** : (voir ci-dessus)
   - **Mot de passe** : `Manager2024!`
   - **Rôle** : Sélectionnez **MANAGER**
   - **Code entreprise** : (voir ci-dessus)
4. Cliquez sur **Créer un compte**
5. **Répétez** pour les 14 managers

---

## Format CSV (Copier-Coller)

```csv
nom_complet,email,mot_de_passe,role,code_entreprise
Sophie Martin,sophie.martin@flux.ai,Manager2024!,manager,COMPTABILITE
Lucas Dubois,lucas.dubois@flux.ai,Manager2024!,manager,DESIGN
Marie Lambert,marie.lambert@flux.ai,Manager2024!,manager,DEVELOPPEMENT
Thomas Bernard,thomas.bernard@flux.ai,Manager2024!,manager,FINANCE
Julien Rousseau,julien.rousseau@flux.ai,Manager2024!,manager,FLUX2024
Emma Petit,emma.petit@flux.ai,Manager2024!,manager,IT
Nicolas Leroy,nicolas.leroy@flux.ai,Manager2024!,manager,JURIDIQUE
Camille Moreau,camille.moreau@flux.ai,Manager2024!,manager,LOGISTIQUE
Antoine Simon,antoine.simon@flux.ai,Manager2024!,manager,MARKETING
Laura Fournier,laura.fournier@flux.ai,Manager2024!,manager,OPERATIONS
Maxime Girard,maxime.girard@flux.ai,Manager2024!,manager,PRODUCT
Sarah Bonnet,sarah.bonnet@flux.ai,Manager2024!,manager,RH
Mathieu Dupont,mathieu.dupont@flux.ai,Manager2024!,manager,SUPPORT
Léa Garnier,lea.garnier@flux.ai,Manager2024!,manager,VENTES
```

---

## Vérification Après Création

Pour vérifier que tous les managers sont bien créés :

```sql
SELECT
  p.full_name,
  p.email,
  p.role,
  t.name as equipe_assignee
FROM profiles p
LEFT JOIN teams t ON p.assigned_team_id = t.id
WHERE p.role = 'manager'
ORDER BY p.full_name;
```

Vous devriez voir **14 managers**, chacun assigné à son équipe.

---

## Notes Importantes

1. **Mot de passe unique** : Tous les managers ont le même mot de passe `Manager2024!` pour simplifier les tests
2. **Email unique** : Chaque manager a un email unique `prenom.nom@flux.ai`
3. **Codes valides** : Tous les codes entreprise existent dans la base de données
4. **Assignation automatique** : Quand le manager entre son code, il sera automatiquement assigné à son équipe

---

## État de la Base de Données

- ✅ **0 manager existant** (tous supprimés)
- ✅ **0 demande d'adhésion** en attente
- ✅ **0 demande de transfert** en attente
- ✅ **0 demande employé** en attente
- ✅ **14 équipes** configurées
- ✅ **14 codes entreprise** valides
- 🔄 **14 nouveaux managers** à créer

**Base de données 100% propre - Prête à créer les 14 nouveaux managers**
