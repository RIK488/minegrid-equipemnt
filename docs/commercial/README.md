# Documents commerciaux MineGrid Équipement

## Référence

| Document | Usage |
|---|---|
| [referentiel-solutions.pdf](referentiel-solutions.pdf) ([source](referentiel-solutions.md)) | Interne : chaque solution reprise du code de la plateforme (`REKA157/minegrid-equipemnt`), son état en ligne au 1er-2 octobre, ce qu'on peut en dire, et les actions de production à faire avant la campagne CIC |

## Documents pour les prospects

| Document | Format | Usage |
|---|---|---|
| [plaquette-generale.pdf](plaquette-generale.pdf) | A4 recto-verso | Trouver, chiffrer, tracer ; côté acheteur et côté vendeur ; dossier de transaction ; neuf services ; formules |
| [plaquette-vendeurs-loueurs.pdf](plaquette-vendeurs-loueurs.pdf) | A4 recto | Concessionnaires, loueurs, importateurs, exploitants qui cèdent |
| [grille-tarifaire.pdf](grille-tarifaire.pdf) | A4 recto | Gratuit, Premium 20, Pro 50, Enterprise 200 USD/mois HT, selon le côté |
| [argumentaire-commercial.md](argumentaire-commercial.md) | Texte, interne | Positionnement, cibles, objections, courriel, script d'appel, démonstration |

## Mission CIC Aidexport (Maroc)

| Document | Usage |
|---|---|
| [cic/guide-entretien-ameliore.md](cic/guide-entretien-ameliore.md) | Propositions d'ADS IDF sur le guide d'entretien de CIC, questions 10 à 13 réécrites, score A/B/C |
| [cic/fiche-enqueteur-cic.pdf](cic/fiche-enqueteur-cic.pdf) | Une page pour l'enquêteur : présentation de 30 secondes, argument par profil, ce qu'on ne dit pas |
| [cic/dossier-osint-prospects.pdf](cic/dossier-osint-prospects.pdf) ([source](cic/dossier-osint-prospects.md)) | Interne ADS IDF : 17 fiches de prospects, synthèse, ordre d'appel, corrections à transmettre à CIC |

Sources HTML et CSS dans [sources/](sources/). Régénérer les plaquettes : `bash docs/commercial/sources/generer-pdf.sh`.
Régénérer le dossier OSINT : `pandoc` vers `sources/dossier-osint.html`, puis Chromium (voir l'historique git).

## Sources du contenu

- Code de la plateforme : dépôt `REKA157/minegrid-equipemnt`, branche `audit/production-2026-09-29` (2 octobre 2026).
- Audit complet du 10 septembre 2026 et bilan en ligne du 1er octobre 2026 (27 points sondés).
- « MineGrid — Valeurs ajoutées et pitch » et fiche mémo IMC Morocco 2026 (2 octobre 2026).
- Le site n'était pas joignable depuis l'environnement de rédaction le 21 octobre 2026 : rien n'a été revérifié en
  ligne ce jour-là.
- Seuls chiffres cités, comme le prescrit la fiche mémo : plus de 16 000 annonces, 10 devises, 4 implantations,
  9 services.

## Points à valider avant diffusion

1. **Deux dépôts.** `RIK488/minegrid-equipemnt` (celui-ci) est une ancienne copie : tarifs périmés, pas de dossier de
   transaction. Le code de référence est `REKA157/minegrid-equipemnt`.
2. **Solutions pas encore en ligne** (radar, appels d'offres assistés, dossier complet, gestion du parc, messagerie,
   abonnements payants) : présentées comme ouvertes dans un pilote accompagné. Voir le référentiel, section 5.
3. **Avantages du pilote (Q11 du guide CIC)** : la liste proposée (formule offerte, import du parc fait par l'équipe,
   inspection prise en charge, interlocuteur dédié) est une décision commerciale de la direction.
4. **Défauts du site relevés le 2 octobre** (filtre Secteur sans résultat, recherche Komatsu vide, annonces à 0,00 MAD,
   estimations marché contradictoires) : à corriger avant que CIC n'oriente des prospects vers le site.
5. **Dossier OSINT** : chiffres tirés d'extraits de recherche, à relire sur la source avant de les citer ; document
   interne, ne pas transmettre aux prospects. Le transmettre à CIC relève de votre décision.
6. **Logos de banques** : les banques partenaires sont citées dans le texte par le site ; leurs logos ne sont pas
   utilisés sans accord écrit.
