import React, { useMemo } from 'react';
import { Building2, Globe2, ShieldCheck } from 'lucide-react';
import { useCategoryCounts, usePublicMachineCount } from '../hooks/queries';

/** Marques souvent recherchées sur la marketplace (texte, pas d'assets requis). */
const PARTNER_BRANDS = ['Caterpillar', 'Volvo', 'Komatsu', 'Liebherr', 'JCB', 'Hitachi'];

export default function HomeTrustSection() {
  const { data: counts, isLoading: countsLoading } = useCategoryCounts();
  const { data: machineTotal = 0, isLoading: totalLoading } = usePublicMachineCount();

  const activeSectors = useMemo(() => {
    if (!counts) return 0;
    return Object.values(counts).filter((n) => n > 0).length;
  }, [counts]);

  const loading = countsLoading || totalLoading;

  return (
    <section className="border-y border-gray-200 bg-gray-50" aria-labelledby="trust-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <h2 id="trust-heading" className="sr-only">
          Réassurance et marques
        </h2>

        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Équipements couramment listés sur la plateforme
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
          {PARTNER_BRANDS.map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
            >
              {name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-3xl sm:text-4xl font-bold text-orange-600 tabular-nums">
              {loading ? '…' : machineTotal.toLocaleString('fr-FR')}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">Annonces catalogue</p>
            <p className="mt-1 text-xs text-gray-500">Machines et équipements publiés</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-3xl sm:text-4xl font-bold text-orange-600 tabular-nums">
              {countsLoading ? '…' : activeSectors}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">Secteurs avec annonces</p>
            <p className="mt-1 text-xs text-gray-500">Transport, mines, BTP, levage…</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
            <div className="flex gap-3 text-orange-600">
              <Globe2 className="h-8 w-8" aria-hidden />
              <Building2 className="h-8 w-8" aria-hidden />
              <ShieldCheck className="h-8 w-8" aria-hidden />
            </div>
            <p className="text-sm font-medium text-gray-900">Présence Afrique de l&apos;Ouest</p>
            <p className="text-xs text-gray-500 max-w-xs">
              Accompagnement commercial et logistique pour vos projets miniers et travaux publics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
