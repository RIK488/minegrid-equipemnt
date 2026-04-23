import React from 'react';
import { ChevronLeft } from 'lucide-react';

export type LegalSlug = 'mentions' | 'privacy' | 'terms';

interface LegalStaticPageProps {
  slug: LegalSlug;
}

const TITLES: Record<LegalSlug, string> = {
  mentions: 'Mentions légales',
  privacy: 'Politique de confidentialité',
  terms: "Conditions générales d'utilisation",
};

export default function LegalStaticPage({ slug }: LegalStaticPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <a
        href="#"
        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </a>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{TITLES[slug]}</h1>
      <div className="text-gray-700 space-y-4 text-sm sm:text-base leading-relaxed">
        {slug === 'mentions' && (
          <>
            <p>
              <strong>Éditeur du site :</strong> Minegrid Équipement — plateforme de mise en relation
              et de services autour des équipements industriels et machines de chantier en Afrique.
            </p>
            <p>
              <strong>Contact :</strong>{' '}
              <a href="mailto:contact@minegrid.com" className="text-orange-600 hover:underline">
                contact@minegrid.com
              </a>
            </p>
            <p>
              <strong>Hébergement :</strong> les informations d&apos;hébergement (prestataire, siège)
              seront complétées ici conformément à l&apos;obligation légale en vigueur dans votre pays.
            </p>
            <p>
              Les présentes mentions constituent une base informative. Elles doivent être relues et
              validées par votre conseil avant mise en production définitive.
            </p>
          </>
        )}
        {slug === 'privacy' && (
          <>
            <p>
              Nous collectons les données strictement nécessaires au fonctionnement du service
              (compte utilisateur, annonces, messages, paiements le cas échéant) et au respect de nos
              obligations légales.
            </p>
            <p>
              Les données de contact envoyées via le formulaire sont stockées dans notre base sécurisée
              pour vous recontacter. Vous pouvez demander l&apos;accès, la rectification ou la suppression
              en écrivant à{' '}
              <a href="mailto:contact@minegrid.com" className="text-orange-600 hover:underline">
                contact@minegrid.com
              </a>
              .
            </p>
            <p>
              Cette politique est un canevas à adapter (durées de conservation, sous-traitants,
              cookies, transferts hors UE si applicable) avec votre DPO ou votre avocat.
            </p>
          </>
        )}
        {slug === 'terms' && (
          <>
            <p>
              L&apos;utilisation du site implique l&apos;acceptation des présentes conditions. Les
              annonces publiées par les vendeurs restent sous leur responsabilité (exactitude des
              informations, conformité réglementaire, disponibilité du bien).
            </p>
            <p>
              Minegrid Équipement peut retirer tout contenu manifestement illicite ou trompeur et
              suspendre un compte en cas de manquement grave aux règles de la communauté.
            </p>
            <p>
              Les présentes CGU sont un modèle de base : elles doivent être complétées (prix des
              services, litiges, droit applicable, médiation consommateur, etc.) avant signature
              contractuelle avec vos clients B2B.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
