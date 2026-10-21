# Documents commerciaux Minegrid Équipement

| Document | Format | Usage |
|---|---|---|
| [plaquette-generale.pdf](plaquette-generale.pdf) | A4 recto-verso | Présentation générale : marketplace, Espace Pro, services, démarrage |
| [plaquette-vendeurs-loueurs.pdf](plaquette-vendeurs-loueurs.pdf) | A4 recto | Prospection des vendeurs et loueurs d'engins |
| [grille-tarifaire.pdf](grille-tarifaire.pdf) | A4 recto | Formules Gratuit, Premium, Pro, Entreprise et comparatif |
| [argumentaire-commercial.md](argumentaire-commercial.md) | Texte | Positionnement, cibles, objections, courriel de prospection, script d'appel, démonstration |

Les sources sont dans [sources/](sources/) (HTML et CSS, logo tiré de `public/`). Après modification :
`bash docs/commercial/sources/generer-pdf.sh`.

## Sources du contenu

Le contenu provient du code de la branche `commit-changes` (avril 2026) : `README.md`, `src/pages/Register.tsx`
(formules et tarifs), `src/pages/Services.tsx` (services), `src/data/categories.ts` (catégories d'engins),
`src/components/Hero.tsx` (accroche), `src/components/Footer.tsx` (contact), `src/pages/LeadsInbox.tsx` (demandes de
devis). Aucun chiffre d'activité (nombre d'annonces, de clients, de pays) n'est cité : le site les calcule en direct et
aucune valeur publiable n'est disponible dans le dépôt.

## Points à valider avant diffusion

1. **Tarifs incohérents dans le code.** Les plaquettes reprennent la page d'inscription (`Register.tsx`, `Dashboard.jsx`) :
   Premium 30, Pro 70, Entreprise à partir de 200 USD/mois. Mais `ProSubscription.tsx` affiche Pro 70, Premium 149,
   Entreprise 299 USD ; `Premium.tsx` 29,99 / 49,99 / 99,99 ; `PremiumServices.tsx` 29 / 89 / 149 ; le guide
   `GUIDE_SYSTEME_PAIEMENT_CODE_PROMO.md` 29 / 79 / 199 €. Il faut fixer une grille unique, sur le site comme sur la
   plaquette.
2. **Coordonnées.** Le site indique `contact@minegrid.com` et Abidjan (Côte d'Ivoire), sans téléphone public ; le devis
   (`QuoteGenerator.tsx`) utilise `contact@minegrid-equipement.com`. Ajouter l'adresse du site web et un numéro dès
   qu'ils sont publics.
3. **Services d'accompagnement** (financement, transport, maintenance, formation, conseil). Ils sont présentés « sur
   demande » : confirmer qu'ils sont assurés directement ou par des partenaires. Les mentions de la page Services qui
   engagent (« assurance transport incluse », « certification officielle », « pièces d'origine garanties ») n'ont pas
   été reprises faute de contrat connu.
4. **Logos de banques** (`public/image/banks/`) : non utilisés, aucun accord de partenariat n'étant documenté.
5. **Paiement en ligne** : le guide de paiement décrit une « simulation de traitement » de la carte. La grille dit
   seulement « modalités précisées à la souscription » tant que Stripe n'est pas en production.
6. **Global Monitor** (veille des projets miniers et d'infrastructure) : non présenté, ses projets affichés sont des
   données de démonstration (`source: 'Demo'`). À ajouter dès qu'il repose sur des sources réelles.
