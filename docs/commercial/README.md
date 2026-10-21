# Documents commerciaux MineGrid Équipement

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

- Site en ligne minegrid-equipement.com tel que relevé le 2 octobre 2026 dans « MineGrid — Valeurs ajoutées et pitch »
  et la fiche mémo du stand IMC Morocco 2026. Le site n'était pas joignable depuis l'environnement de rédaction le
  21 octobre 2026 : rien n'a été revérifié en ligne ce jour-là.
- Seuls chiffres cités, comme le prescrit la fiche mémo : plus de 16 000 annonces, 10 devises, 4 implantations,
  9 services.

## Points à valider avant diffusion

1. **Le dépôt n'est pas le site.** La branche `commit-changes` affiche encore d'autres tarifs (inscription 30 / 70 / 200 ;
   abonnement Pro 70 / 149 / 299), Abidjan comme seule adresse et aucun dossier de transaction : le code en ligne vit
   ailleurs. Les plaquettes suivent le site.
2. **Avantages du pilote (Q11 du guide CIC)** : la liste proposée (formule offerte, import du parc fait par l'équipe,
   inspection prise en charge, interlocuteur dédié) est une décision commerciale de la direction.
3. **Défauts du site relevés le 2 octobre** (filtre Secteur sans résultat, recherche Komatsu vide, annonces à 0,00 MAD,
   estimations marché contradictoires) : à corriger avant que CIC n'oriente des prospects vers le site.
4. **Dossier OSINT** : chiffres tirés d'extraits de recherche, à relire sur la source avant de les citer ; document
   interne, ne pas transmettre aux prospects. Le transmettre à CIC relève de votre décision.
5. **Logos de banques** : les banques partenaires sont citées dans le texte par le site ; leurs logos ne sont pas
   utilisés sans accord écrit.
