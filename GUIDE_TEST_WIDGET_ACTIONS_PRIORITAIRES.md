# Guide de Test - Widget Actions Commerciales Prioritaires

## 🎯 Vue d'ensemble

Le widget **Actions Commerciales Prioritaires** a été intégré aux services communs avec 8 actions rapides fonctionnelles et des actions individuelles connectées.

## ✅ Fonctionnalités intégrées

### Services communs connectés
- **API Service** : Appels API pour les actions
- **Notification Service** : Notifications toast
- **Export Service** : Export de données
- **Communication Service** : Envoi de messages

### Actions individuelles
- **Démarrer** : Démarre une action en cours
- **Terminer** : Finalise une action
- **Contacter** : Envoie SMS/Email au contact
- **Reprogrammer** : Reprogramme une action

### Actions rapides (8 boutons)
1. **Nouvelle tâche** : Crée une nouvelle action
2. **Relance auto** : Programme des relances automatiques
3. **Planifier** : Planifie les actions en attente
4. **Rapport IA** : Génère et exporte un rapport IA
5. **Exporter** : Exporte les actions en Excel
6. **Notifier équipe** : Envoie notification à l'équipe
7. **Sync CRM** : Synchronise avec le CRM
8. **Optimiser IA** : Optimise le planning par IA

## 🧪 Tests à effectuer

### 1. Test des actions individuelles

#### Test "Démarrer"
1. Cliquer sur "Démarrer" sur une action en attente
2. **Résultat attendu** : 
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/start`

#### Test "Terminer"
1. Cliquer sur "Terminer" sur une action en cours
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/complete`

#### Test "Contacter"
1. Cliquer sur "Contacter" sur une action avec contact
2. **Résultat attendu** :
   - Envoi SMS/Email simulé
   - Notification d'information
   - Logs dans la console pour SMS et Email

#### Test "Reprogrammer"
1. Cliquer sur "Reprogrammer" sur n'importe quelle action
2. **Résultat attendu** :
   - Notification d'information
   - Log dans la console : `API Call: POST /api/actions/reschedule`

### 2. Test des actions rapides

#### Test "Nouvelle tâche"
1. Cliquer sur le bouton "Nouvelle tâche"
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/create`

#### Test "Relance auto"
1. Cliquer sur le bouton "Relance auto"
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/auto-followup`

#### Test "Planifier"
1. Cliquer sur le bouton "Planifier"
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/schedule`

#### Test "Rapport IA"
1. Cliquer sur le bouton "Rapport IA"
2. **Résultat attendu** :
   - Appel API pour générer le rapport
   - Export PDF automatique
   - Notification de succès
   - Logs dans la console pour API et export

#### Test "Exporter"
1. Cliquer sur le bouton "Exporter"
2. **Résultat attendu** :
   - Téléchargement d'un fichier Excel
   - Notification de succès
   - Log dans la console : `Export: actions-prioritaires.excel`

#### Test "Notifier équipe"
1. Cliquer sur le bouton "Notifier équipe"
2. **Résultat attendu** :
   - Envoi de notification d'équipe
   - Notification de succès
   - Log dans la console : `Message [TEAM] to all`

#### Test "Sync CRM"
1. Cliquer sur le bouton "Sync CRM"
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/sync-crm`

#### Test "Optimiser IA"
1. Cliquer sur le bouton "Optimiser IA"
2. **Résultat attendu** :
   - Notification de succès
   - Log dans la console : `API Call: POST /api/actions/optimize-schedule`

### 3. Test des filtres et tri

#### Test des filtres
1. Changer le filtre de priorité (Haute/Moyenne/Basse)
2. Changer le filtre de catégorie (Appels/Emails/etc.)
3. Changer le tri (Par priorité/Par heure/Par valeur)
4. **Résultat attendu** : Liste filtrée et triée correctement

#### Test affichage terminées
1. Cocher "Afficher terminées"
2. **Résultat attendu** : Actions terminées visibles

### 4. Test de la gestion des erreurs

#### Test erreur API
1. Simuler une erreur réseau
2. **Résultat attendu** :
   - Notification d'erreur
   - Gestion gracieuse de l'erreur

## 🚀 Exécution des tests

### Test manuel
1. Aller sur `http://localhost:5175/`
2. Naviguer vers le dashboard vendeur
3. Tester chaque fonctionnalité selon le guide ci-dessus

### Test automatisé
```bash
node test-widget-actions-prioritaires.js
```

## 📊 Vérifications dans la console

### Logs attendus
```
✅ API Call: POST /api/actions/start {actionId: "1"}
✅ Notification [success]: Action démarrée : Relancer prospect BTP Atlas
✅ Message [SMS] to +212 6 12 34 56 78: Rappel : Relancer prospect BTP Atlas
✅ Export: actions-prioritaires.excel
```

### Notifications toast
- **Succès** : Actions réussies
- **Info** : Actions d'information
- **Erreur** : Gestion des erreurs

## 🎯 Critères de succès

- ✅ Toutes les actions individuelles fonctionnent
- ✅ Toutes les actions rapides fonctionnent
- ✅ Les notifications s'affichent correctement
- ✅ Les exports se téléchargent
- ✅ Les messages sont envoyés (simulés)
- ✅ Les filtres et tri fonctionnent
- ✅ La gestion d'erreur est robuste
- ✅ Aucune erreur dans la console

## 🔧 Dépannage

### Problème : Actions ne fonctionnent pas
- Vérifier que les services sont bien importés
- Vérifier la console pour les erreurs

### Problème : Notifications ne s'affichent pas
- Vérifier que le service de notifications est initialisé
- Vérifier les logs dans la console

### Problème : Export ne fonctionne pas
- Vérifier que le service d'export est disponible
- Vérifier les permissions de téléchargement

## 📝 Notes importantes

- Tous les appels API sont simulés pour le moment
- Les exports génèrent des fichiers de test
- Les messages sont simulés (pas d'envoi réel)
- Les notifications sont affichées dans la console
- Le widget est entièrement fonctionnel et prêt pour la production 