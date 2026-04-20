# Guide de Test - Fonctionnalité d'Invitation d'Utilisateurs

## 🎯 Objectif
Tester la fonctionnalité complète d'invitation d'utilisateurs dans l'espace Pro du portail.

## 📋 Prérequis
1. Être connecté au portail Pro
2. Avoir les permissions d'administrateur
3. Avoir exécuté le script de création de la table `user_invitations`

## 🚀 Étapes de Test

### 1. Accès à la fonctionnalité
- [ ] Aller sur `#pro` dans l'URL
- [ ] Cliquer sur l'onglet "Utilisateurs"
- [ ] Vérifier que le bouton "Inviter un utilisateur" est visible et cliquable

### 2. Interface de la page Utilisateurs
- [ ] Vérifier l'affichage des 4 types de rôles avec leurs descriptions :
  - **Administrateur** : Accès complet à toutes les fonctionnalités
  - **Manager** : Gestion des équipements et commandes
  - **Technicien** : Accès aux interventions de maintenance
  - **Lecteur** : Consultation uniquement
- [ ] Vérifier que la section "Invitations envoyées" s'affiche
- [ ] Vérifier le message "Aucune invitation envoyée" si aucune invitation n'existe

### 3. Test d'invitation d'utilisateur
- [ ] Cliquer sur "Inviter un utilisateur"
- [ ] Vérifier l'ouverture du modal d'invitation
- [ ] Tester la validation des champs :
  - [ ] Email vide → Message d'erreur
  - [ ] Email invalide → Message d'erreur
  - [ ] Rôle non sélectionné → Message d'erreur
- [ ] Remplir le formulaire avec des données valides :
  - Email : `test@example.com`
  - Rôle : `Manager`
- [ ] Cliquer sur "Inviter"
- [ ] Vérifier l'affichage du spinner "Invitation..."
- [ ] Vérifier le message de succès "Utilisateur invité avec succès !"
- [ ] Vérifier la fermeture automatique du modal après 2 secondes

### 4. Vérification de l'invitation créée
- [ ] Vérifier que l'invitation apparaît dans la liste "Invitations envoyées"
- [ ] Vérifier les informations affichées :
  - [ ] Email de l'invité
  - [ ] Rôle attribué
  - [ ] Date d'invitation
  - [ ] Statut "En attente" (badge jaune)
  - [ ] Date d'expiration (7 jours)
  - [ ] Bouton "Annuler" visible

### 5. Test d'annulation d'invitation
- [ ] Cliquer sur "Annuler" pour une invitation en attente
- [ ] Vérifier l'affichage de la confirmation "Êtes-vous sûr de vouloir annuler cette invitation ?"
- [ ] Confirmer l'annulation
- [ ] Vérifier que l'invitation disparaît de la liste ou change de statut

### 6. Test de multiples invitations
- [ ] Créer plusieurs invitations avec différents rôles :
  - [ ] `admin@example.com` → Administrateur
  - [ ] `technician@example.com` → Technicien
  - [ ] `viewer@example.com` → Lecteur
- [ ] Vérifier que toutes les invitations s'affichent correctement
- [ ] Vérifier que les rôles sont bien traduits en français

### 7. Test de gestion des erreurs
- [ ] Tester avec un email déjà invité (si applicable)
- [ ] Tester avec des permissions insuffisantes
- [ ] Vérifier les messages d'erreur appropriés

## 🔍 Vérifications Techniques

### Base de données
- [ ] Vérifier que la table `user_invitations` existe
- [ ] Vérifier que les invitations sont bien insérées
- [ ] Vérifier les contraintes de validation des rôles
- [ ] Vérifier l'expiration automatique (7 jours)

### Sécurité
- [ ] Vérifier que seuls les administrateurs peuvent inviter
- [ ] Vérifier les politiques RLS (Row Level Security)
- [ ] Vérifier que les utilisateurs normaux ne peuvent pas accéder aux invitations

### Performance
- [ ] Vérifier le temps de chargement de la liste des invitations
- [ ] Vérifier la réactivité de l'interface
- [ ] Vérifier que les requêtes sont optimisées

## 📊 Résultats Attendus

### ✅ Succès
- Le bouton "Inviter un utilisateur" fonctionne correctement
- Les invitations sont créées et affichées
- L'annulation d'invitations fonctionne
- L'interface est réactive et intuitive
- Les messages d'erreur et de succès sont clairs

### ❌ Problèmes Potentiels
- Erreurs de permissions Supabase
- Problèmes de RLS (Row Level Security)
- Erreurs de validation des données
- Problèmes d'affichage sur mobile

## 🛠️ Dépannage

### Si le bouton ne fonctionne pas
1. Vérifier les imports dans `ProDashboard.tsx`
2. Vérifier que `inviteClientUser` est bien importée
3. Vérifier la console pour les erreurs JavaScript

### Si les invitations ne s'affichent pas
1. Vérifier que la table `user_invitations` existe
2. Vérifier les politiques RLS
3. Vérifier les permissions de l'utilisateur connecté

### Si les invitations ne sont pas créées
1. Vérifier les logs de la console
2. Vérifier les permissions d'écriture dans la base
3. Vérifier la structure de la table

## 🎉 Validation Finale

La fonctionnalité est considérée comme fonctionnelle si :
- [ ] Toutes les étapes de test passent
- [ ] L'interface est intuitive et réactive
- [ ] Les données sont correctement sauvegardées
- [ ] La sécurité est respectée
- [ ] Les messages d'erreur sont informatifs

---

**Note** : Ce guide peut être adapté selon les besoins spécifiques du projet et les évolutions de l'interface. 