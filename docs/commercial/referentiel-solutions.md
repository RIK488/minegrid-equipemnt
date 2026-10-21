# Référentiel des solutions MineGrid Équipement

**Pour qui** : direction ADS IDF, équipe commerciale, préparation de la campagne CIC Aidexport. Document interne.
**Date** : 21 octobre 2026.

## Sources

Ce référentiel reprend les solutions depuis le dossier de la plateforme, pas depuis les plaquettes :

1. **Le code** : dépôt `REKA157/minegrid-equipemnt`, branche `audit/production-2026-09-29`, dernier commit du
   2 octobre 2026. Grille tarifaire canonique dans `src/config/plans.ts`, dossier transactionnel dans
   `src/pages/TransactionCasePage.tsx`, simulateurs dans `src/components/LogisticsSimulator.tsx` et
   `FinancingSimulator.tsx`, couche « nextgen » (confiance, prix, inspection) dans `src/nextgen/`, radar dans
   `services/monitor-service/`.
2. **L'audit complet du 10 septembre 2026** (session « MineGrid audit complet ») : cartographie, et pour chaque
   fonction, l'écart entre le code et la production.
3. **Le bilan en ligne du 1er octobre 2026** (« Bilan MineGrid en ligne », 27 points sondés sur le site public) et le
   journal `docs/build/ETAT.md` du dépôt, mis à jour le 2 octobre.

Rien n'a pu être revérifié en ligne le 21 octobre : le site n'est pas joignable depuis l'environnement de rédaction.
**Ce qui a été corrigé ou déployé après le 2 octobre n'apparaît pas ici.** À mettre à jour par la direction.

## Lecture des états

- **En ligne** : fonctionne sur le site public au dernier relevé ; peut se montrer à un prospect.
- **Limité** : fonctionne en partie ; à montrer avec la limite dite d'emblée.
- **À activer** : codé et testé dans le dépôt, mais absent ou cassé en production (migration non appliquée, fonction non
  déployée, paquet du 15 août toujours servi). À ne pas promettre en libre-service ; possible dans un pilote
  accompagné une fois activé.
- **Hors offre** : non proposé.

## 1. Côté acheteur (entreprise de BTP, exploitant)

| Solution | Ce que fait le code | État au 1er-2 octobre | Ce qu'on peut dire |
|---|---|---|---|
| Catalogue et recherche | 16 397 annonces en base ; recherche, marque, catégorie, secteur, état et année filtrés côté base | **Limité** : la version en ligne (paquet du 15 août) ne cherche que dans les 1 000 premières annonces ; la recherche complète est prête dans le paquet du 1er octobre | « Catalogue multi-marques, neuf et occasion » ; ne pas faire de recherche en direct avant le téléversement |
| Origine des annonces | Import d'annonces d'enchères internationales | **Défaut** : 13 717 annonces sur 16 397 (83,7 %) appartiennent à un compte vendeur fictif laissé par l'import ; 197 photos sur 200 sont hébergées chez Ritchie Bros / IronPlanet | Ne pas présenter ces annonces comme des vendeurs joignables ; un devis sur l'une d'elles n'a personne en face (voir § 5) |
| Fiche machine | Prix, caractéristiques, fiche technique, machines similaires, vitrine du vendeur | **En ligne** | Montrable |
| Prix dans la devise du visiteur | 10 devises (MAD, EUR, USD, XOF, XAF, NGN, ZAR, EGP, KES, GHS) | **Limité** : la détection du pays est bloquée (repli sur la langue du navigateur) et les taux sont figés en base (1 € = 10,85 MAD) | « Prix affichés dans votre devise », sans parler de taux du jour ; régler la devise à la main en démonstration |
| Position par rapport au marché | Estimation médiane sur observations de prix ; invisible sous 3 observations | **À activer** : la table `price_observations` n'existe pas en production | Ne pas la citer |
| Niveau de vérification du vendeur | Badge de confiance calculé (`trust_profiles`) | **À activer** : tables de confiance absentes, tout vendeur apparaît « non vérifié » | Ne pas citer le badge |
| Simulateur de transport | Départ Maroc (Casablanca, Tanger, Agadir) ou Europe (Marseille, Rotterdam, Hambourg, Anvers) vers 8 villes d'Afrique de l'Ouest et centrale ; pas de destination au Maroc | **En ligne** (calcul dans le navigateur) | « Estimation indicative » ; livraison au Maroc sur devis |
| Simulateur de financement | Mensualité indicative ; banques présentées : Bank of Africa, Attijariwafa bank, Saham Bank | **En ligne** pour la simulation ; la pré-demande dépend des tables de la chaîne transactionnelle | « Mensualité indicative » ; pas de taux ni d'accord promis |
| Demande de devis | Formulaire sur la fiche, boîte des demandes côté vendeur | **En ligne** (enregistrée ; données privées bien protégées) | Montrable, sur une annonce d'un vendeur réel |
| Dossier transactionnel | Un dossier par affaire : participants (acheteur, vendeur), partenaires invités par rôle (mécanicien pour l'inspection, courtier pour le financement, transporteur, transitaire pour la douane, logisticien), étapes inspection, financement, transport, douane, clôture, journal | **Limité** : la création fonctionne ; au 10 septembre, participants jamais créés et aucune transition faute de migrations (p5, p29) | Présenter comme « dossier qui coordonne inspection, financement, transport et douane » dans un pilote accompagné |
| Paiement entre acheteur et vendeur | Le code contient un séquestre (`escrowService`) et un bouton « Préparer le séquestre » | **Hors offre** (décision ADS IDF) ; aucun prestataire raccordé | Ne jamais parler de paiement par jalons, de séquestre ni de paiement sécurisé |
| Gestion du parc (Premium) | Équipements, commandes, maintenance, documents | **À activer** : 9 tables de l'espace Pro absentes, écran d'erreur | Ne pas montrer |

## 2. Côté fournisseur (concessionnaire, loueur, exploitant qui cède)

| Solution | Ce que fait le code | État au 1er-2 octobre | Ce qu'on peut dire |
|---|---|---|---|
| Publication d'annonce | Formulaire, jusqu'à 8 photos | **Limité** : aucun espace de stockage n'existe en production, donc publication **sans photo** | Proposer la publication accompagnée par l'équipe |
| Import Excel du parc | Import par webhook n8n, brouillon ou en ligne | **Limité** : le jeton du webhook était exposé dans le paquet en ligne (correctif dans le dépôt, à révoquer côté n8n) | Proposer « vous nous envoyez votre fichier, nous publions » |
| Annonce rédigée avec l'IA | Assistant n8n à partir de la marque et du modèle | Non vérifié en ligne | À démontrer seulement après vérification |
| Vitrine professionnelle | Page de toutes les annonces d'un vendeur | **En ligne** (sans photo pour les nouvelles annonces) | Montrable |
| Boîte des demandes de devis | Liste, statuts | **En ligne** | Montrable |
| Messagerie, notifications, offres | Échanges acheteur-vendeur | **À activer** : tables `messages`, `notifications`, `offers` absentes | Ne pas citer |
| Radar d'opportunités et Global Monitor (Pro) | Service FastAPI en ligne ; projets, alertes, opportunités de vente | **À activer** : le service répond, mais la politique de sécurité du site bloque ses appels ; corrigé dans le paquet du 1er octobre, pas en ligne | Citer comme « en cours d'ouverture » ; démonstration seulement après téléversement |
| Appels d'offres assistés par IA (Pro) | Analyse de DCE, go / no-go, mémoire technique | **Limité** : la fonction IA `tenders-ai` n'est pas déployée (simulation silencieuse) ; travail d'équipe coupé (table absente) | Ne pas démontrer l'IA |
| Cockpits par métier (Enterprise) | Vendeur, loueur (locations à venir, retards), mécanicien, transporteur, transitaire, logisticien, investisseur, courtier, financier | **Limité** : mélange de tables présentes et de widgets alimentés par des données simulées | Ne pas présenter de chiffres de widget comme réels |
| Pipeline commercial (Enterprise) | Demandes et offres en Kanban | **Limité** (dépend des tables offres et messages) | Pilote seulement |
| Équipe et invitations | 5 sièges Enterprise, rôles | **En ligne** (RPC présentes) ; rôles d'appels d'offres non persistés | Montrable sans les rôles AO |

## 3. Services autour de la machine

Neuf services sur demande, réponse annoncée sous 24 heures ouvrées : financement, transport et livraison, maintenance
et réparation, garantie et assurance, location (courte et longue durée, options d'achat), installation, formation,
conseil, sécurité et conformité.

**État** : le formulaire de contact enregistre la demande, mais au 10 septembre **personne ne pouvait la lire et aucun
courriel n'était émis** ; au 29 septembre, la fonction d'envoi en ligne répondait « ok » à un envoi vide. **Avant la
campagne CIC, s'assurer qu'une demande arrive bien à quelqu'un**, sinon la promesse des 24 heures ne tient pas.

La location n'est pas une place de marché avec calendrier de réservation : c'est un service sur demande, et un cockpit
loueur pour gérer son propre parc.

## 4. Formules et paiement

| Formule | Prix | Contenu (code `plans.ts`) |
|---|---|---|
| Gratuit | 0 | Consulter, contacter, demander des devis, publier |
| Premium | 20 USD/mois | Gestion du parc ; équipements, commandes, maintenance ; documents et messages |
| Pro | 50 USD/mois | Appels d'offres assistés par IA, assistant IA, radar d'opportunités, support prioritaire |
| Enterprise | 200 USD/mois | Cockpit par métier, pipeline commercial, 5 utilisateurs, support 24/7 et SLA |

**État** : **aucun abonnement payant ne peut s'activer en ligne au 2 octobre.** La fonction `paddle-webhook` n'est pas
déployée, et `paddle-upgrade` inversait les prix de Premium et Pro. Le code promo échoue lui aussi, faute d'index
unique en base (correctif SQL prêt, à appliquer). Pour un pilote, l'accès se donne aujourd'hui à la main par la
direction.

## 5. Ce que cela change pour la campagne CIC

Les prospects classés A (TGCC, Mojazine, SBTX, Eurogrues, SOSMAJED) s'intéressent surtout à la cession d'engins, au
dossier transactionnel, au radar et aux appels d'offres. Ce sont précisément les solutions « à activer ». Deux
conséquences :

1. **Proposer un pilote accompagné, pas une inscription en libre-service.** L'équipe publie le parc du prospect,
   ouvre et suit ses dossiers, et lui donne l'accès aux formules à la main. C'est ce que disent désormais la fiche de
   l'enquêteur et le guide d'entretien.
2. **Faire passer en production, avant les premiers rendez-vous, ce que le pilote utilisera.** L'ordre vient du bilan
   du 1er octobre et de l'audit :

| # | Action (production, à la charge de la direction) | Débloque |
|---|---|---|
| 1 | Couper ou protéger la fonction `renders-ai`, ouverte à tous ; révoquer le jeton n8n exposé | Sécurité, avant toute communication |
| 2 | Téléverser le paquet du 1er octobre, `.htaccess` compris, puis `npm run verifier:deploiement` | Radar, Global Monitor, opportunités, recherche complète |
| 3 | Appliquer le correctif du code promo et déployer `paddle-webhook` | Accès des pilotes, puis abonnements |
| 4 | Créer les espaces de stockage avec leurs règles d'accès | Photos des annonces publiées |
| 5 | Appliquer p5, p29 et p34 | Dossier transactionnel complet ; repérage des annonces au vendeur fictif |
| 6 | Vérifier que le formulaire de contact et les demandes de service arrivent à quelqu'un | Promesse des 24 heures |
| 7 | Décider du sort des 13 717 annonces importées : les marquer « sourcing MineGrid » et router leurs devis vers l'équipe, ou les retirer | Crédibilité du chiffre « plus de 16 000 annonces » |
| 8 | Créer en production les tables de messagerie, d'offres et de l'espace Pro, ou retirer ces écrans | Premium et Enterprise |

## 6. Écarts avec les documents commerciaux

| Affirmation des plaquettes | Réalité au 2 octobre | Traitement |
|---|---|---|
| « Plus de 16 000 annonces » | Vrai en base, mais 83,7 % sans vendeur réel | Garder seulement si l'action 7 est faite |
| Position par rapport au marché, niveau de vérification du vendeur, badge de confiance | Tables absentes en production | Retirées des documents remis aux prospects tant qu'elles ne sont pas activées |
| Radar, appels d'offres assistés, pipeline | Codés, bloqués ou partiels en ligne | Présentés comme ouverts dans le pilote |
| Dossier transactionnel en quatre étapes | Création seulement en ligne | Présenté comme coordination de l'inspection, du financement, du transport et de la douane, dans le pilote |
| Paiement par jalons | Hors offre | Retiré le 21 octobre |
| Paiement des abonnements par Paddle, sans engagement | Activation non déployée | Conservé (c'est le mode prévu), avec accès à la main pendant le pilote |
