import React, { useState } from 'react';

interface Equipment {
  id: number;
  name: string;
  category: string;
  daysInStock: number;
  views: number;
  clicks: number;
  contacts: number;
  visibilityScore: number;
  aiTip: string;
  alert: boolean;
}

const mockEquipments: Equipment[] = [
  {
    id: 1,
    name: 'CAT 320D — Pelle sur chenilles',
    category: 'Pelle',
    daysInStock: 61,
    views: 53,
    clicks: 9,
    contacts: 0,
    visibilityScore: 42,
    aiTip: "Machine consultée mais sans contact — ajoutez une photo en situation réelle et proposez une remise de 3% cette semaine.",
    alert: true
  },
  {
    id: 2,
    name: 'Komatsu D6 — Bulldozer',
    category: 'Bulldozer',
    daysInStock: 92,
    views: 8,
    clicks: 0,
    contacts: 0,
    visibilityScore: 28,
    aiTip: "Machine en stock depuis 92 jours sans clic. Proposez une livraison gratuite ou baissez le prix.",
    alert: true
  }
];

const categories = ['Toutes', 'Pelle', 'Bulldozer'];
const anciennetes = ['Toutes', '30j+', '60j+', '90j+'];

const StockStatusWidget: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedAnciennete, setSelectedAnciennete] = useState('Toutes');

  const filtered = mockEquipments.filter(e =>
    (selectedCategory === 'Toutes' || e.category === selectedCategory) &&
    (selectedAnciennete === 'Toutes' ||
      (selectedAnciennete === '30j+' && e.daysInStock >= 30) ||
      (selectedAnciennete === '60j+' && e.daysInStock >= 60) ||
      (selectedAnciennete === '90j+' && e.daysInStock >= 90))
  );

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-md w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-orange-700">Plan d’action Stock & Revente</h2>
        <div className="flex gap-2">
          <select
            className="rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="rounded border border-orange-200 bg-white text-orange-700 px-2 py-1 text-xs focus:outline-none"
            value={selectedAnciennete}
            onChange={e => setSelectedAnciennete(e.target.value)}
          >
            {anciennetes.map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-orange-600 text-sm text-center py-8">Aucune machine à risque selon vos filtres.</div>
        )}
        {filtered.map(eq => (
          <div
            key={eq.id}
            className="bg-white border border-orange-100 rounded-lg p-4 flex flex-col gap-2 shadow-sm relative"
          >
            {eq.alert && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] font-normal px-1 py-0.5 rounded-full shadow tracking-tight">Visibilité faible</span>
            )}
            <div className="font-semibold text-orange-700 flex items-center gap-2">
              {eq.name}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span>🕒 {eq.daysInStock}j</span>
              <span>👁️ {eq.views} vues</span>
              <span>🖱️ {eq.clicks} clics</span>
              <span>📩 {eq.contacts} contact</span>
            </div>
            <div className="text-xs text-orange-700 font-medium">
              📊 Score visibilité : {eq.visibilityScore}/100
            </div>
            <div className="text-xs text-orange-600 italic flex items-center gap-1">
              💡 <span>{eq.aiTip}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => alert(`Modifier ${eq.name}`)}>Modifier</button>
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => alert(`Ajouter une photo à ${eq.name}`)}>Ajouter photo</button>
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => alert(`Booster ${eq.name}`)}>Booster</button>
              <button className="text-xs bg-orange-100 text-orange-800 border border-orange-300 px-2 py-1 rounded hover:bg-orange-200 transition-colors font-semibold" onClick={() => alert(`Créer une offre flash pour ${eq.name}`)}>Créer offre flash</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockStatusWidget; 