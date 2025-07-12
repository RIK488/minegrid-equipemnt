import React, { useState, useEffect, useMemo } from 'react';
import { Truck, MapPin, Clock, Euro, Info, Calculator, Globe } from 'lucide-react';
import { 
  estimerTransport, 
  availableOrigins, 
  availableDestinations,
  getDestinationsFromOrigin,
  formatCost,
  formatDelay,
  getCostBreakdown,
  getDestinationsByContinent,
  getOriginsByContinent,
  TransportCost
} from '../utils/transport';
import { useCurrencyStore } from '../stores/currencyStore';
import Price from './Price';

interface LogisticsSimulatorProps {
  machineWeight?: number; // Poids en tonnes
  machineVolume?: number; // Volume en m³
  machineValue?: number; // Valeur de la machine en euros
  className?: string;
  isPremium?: boolean; // Ajout pour afficher le détail des coûts automatiquement
}

export default function LogisticsSimulator({ 
  machineWeight, 
  machineVolume, 
  machineValue,
  className = "",
  isPremium = false
}: LogisticsSimulatorProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Casablanca');
  const [selectedDestination, setSelectedDestination] = useState<string>('Abidjan');
  const [selectedOriginContinent, setSelectedOriginContinent] = useState<string>('Maroc');
  const [transportCost, setTransportCost] = useState<TransportCost | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [availableDestinationsForOrigin, setAvailableDestinationsForOrigin] = useState<string[]>([]);

  // 🔄 Récupération de la devise sélectionnée
  const { currentCurrency, rates } = useCurrencyStore();

  const destinationsByContinent = getDestinationsByContinent();
  const originsByContinent = getOriginsByContinent();

  // Correction : bornage des valeurs et avertissement
  let validWeight = machineWeight;
  let validVolume = machineVolume;
  let validValue = machineValue || 50000; // Valeur par défaut si non fournie
  let showWarning = false;

  if (typeof validWeight !== 'number' || isNaN(validWeight) || validWeight < 1 || validWeight > 40) {
    validWeight = 25;
    showWarning = true;
  }
  if (typeof validVolume !== 'number' || isNaN(validVolume) || validVolume < 1 || validVolume > 100) {
    validVolume = 100;
    showWarning = true;
  }
  if (typeof validValue !== 'number' || isNaN(validValue) || validValue < 10000 || validValue > 500000) {
    validValue = 50000;
    showWarning = true;
  }

  // Mettre à jour les destinations disponibles quand l'origine change
  useEffect(() => {
    const destinations = getDestinationsFromOrigin(selectedOrigin);
    setAvailableDestinationsForOrigin(destinations);
    
    // Si la destination actuelle n'est pas disponible, prendre la première
    if (!destinations.includes(selectedDestination) && destinations.length > 0) {
      setSelectedDestination(destinations[0]);
    }
  }, [selectedOrigin, selectedDestination]);

  // Calculer le coût de transport quand les paramètres changent
  useEffect(() => {
    const cost = estimerTransport(selectedOrigin, selectedDestination, validWeight, validVolume, validValue);
    setTransportCost(cost);
  }, [selectedOrigin, selectedDestination, validWeight, validVolume, validValue]);

  // Recalculer l'affichage quand la devise change
  useEffect(() => {
    // Le transportCost ne change pas, mais l'affichage doit être mis à jour
    // car formatCostInCurrency utilise currentCurrency et rates
  }, [currentCurrency, rates]);

  // Affichage du détail des coûts pour premium
  useEffect(() => {
    if (isPremium) setShowDetails(true);
  }, [isPremium]);

  const handleOriginContinentChange = (continent: string) => {
    setSelectedOriginContinent(continent);
    const continentOrigins = originsByContinent[continent] || [];
    if (continentOrigins.length > 0) {
      setSelectedOrigin(continentOrigins[0]);
    }
  };

  const handleOriginChange = (origin: string) => {
    setSelectedOrigin(origin);
  };

  const handleDestinationChange = (destination: string) => {
    setSelectedDestination(destination);
  };

  if (!transportCost) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Truck className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold">Simulateur de transport International</h3>
        </div>
        <p className="text-gray-500">Route de transport non disponible</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Truck className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold">Simulateur de transport International</h3>
        </div>
        {!isPremium && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-600 hover:text-orange-800 text-sm flex items-center"
          >
            <Info className="h-4 w-4 mr-1" />
            {showDetails ? 'Masquer' : 'Voir'} détails
          </button>
        )}
      </div>

      {/* Sélecteurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="h-4 w-4 inline mr-1" />
            Région de départ
          </label>
          <select
            value={selectedOriginContinent}
            onChange={(e) => handleOriginContinentChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Maroc">🇲🇦 Maroc</option>
            <option value="Europe">🇪🇺 Europe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Port de départ
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => handleOriginChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {originsByContinent[selectedOriginContinent]?.map(origin => (
              <option key={origin} value={origin}>{origin}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Destination
          </label>
          <select
            value={selectedDestination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {availableDestinationsForOrigin.map(destination => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Informations sur la machine */}
      {(machineWeight || machineVolume || machineValue) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Caractéristiques de la machine</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {machineWeight && (
              <div className="flex items-center">
                <span className="text-gray-600">Poids:</span>
                <span className="ml-2 font-medium">{machineWeight} tonnes</span>
              </div>
            )}
            {machineVolume && (
              <div className="flex items-center">
                <span className="text-gray-600">Volume:</span>
                <span className="ml-2 font-medium">{machineVolume} m³</span>
              </div>
            )}
            {machineValue && (
              <div className="flex items-center">
                <span className="text-gray-600">Valeur:</span>
                <span className="ml-2 font-medium">
                  <Price amount={machineValue} />
                </span>
              </div>
            )}
          </div>
          {showWarning && (
            <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              Valeur de poids, volume ou prix absente ou incohérente : estimation standard appliquée (25 tonnes, 100 m³, 50 000 €)
            </div>
          )}
        </div>
      )}

      {/* Résultat principal */}
      <div className={`rounded-lg p-6 mb-4 ${
        selectedOriginContinent === 'Maroc' ? 'bg-blue-50' : 'bg-green-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-lg font-semibold ${
              selectedOriginContinent === 'Maroc' ? 'text-blue-900' : 'text-green-900'
            }`}>
              Livraison vers {selectedDestination}
            </h4>
            <p className={`${
              selectedOriginContinent === 'Maroc' ? 'text-blue-700' : 'text-green-700'
            }`}>
              Depuis {selectedOrigin} • {selectedOriginContinent}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              selectedOriginContinent === 'Maroc' ? 'text-blue-900' : 'text-green-900'
            }`}>
              <Price amount={transportCost.cost} />
            </div>
            <div className={`text-sm flex items-center ${
              selectedOriginContinent === 'Maroc' ? 'text-blue-600' : 'text-green-600'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              {formatDelay(transportCost.days)}
            </div>
          </div>
        </div>
      </div>

      {/* Détail des coûts principaux */}
      {showDetails && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Détail des coûts principaux</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Truck className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-700">Transport maritime</span>
              </div>
              <div className="text-lg font-semibold text-green-900">
                <Price amount={transportCost.details.shipping} />
              </div>
              {machineVolume && (
                <div className="text-xs text-green-600 mt-1">
                  {machineVolume} m³ • Tarif {machineVolume >= 3 ? 'volume' : 'base'}
                </div>
              )}
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Calculator className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-xs font-medium text-orange-700">Douane & Taxes</span>
              </div>
              <div className="text-lg font-semibold text-orange-900">
                <Price amount={transportCost.details.customs} />
              </div>
              {machineValue && (
                <div className="text-xs text-orange-600 mt-1">
                  Basé sur <Price amount={machineValue} />
                </div>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Truck className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xs font-medium text-blue-700">Transport terrestre</span>
              </div>
              <div className="text-lg font-semibold text-blue-900">
                <Price amount={transportCost.details.inland} />
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou' 
                  ? 'Destination intérieure' 
                  : 'Port de destination'}
              </div>
              {machineWeight && (
                <div className="text-xs text-blue-500 mt-1">
                  {machineWeight} tonnes • {getWeightCategoryText(machineWeight)}
                </div>
              )}
            </div>
          </div>
          
          {/* Détails du calcul maritime */}
          {machineVolume && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Détails du transport maritime</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Volume: {machineVolume} m³</div>
                <div>• Type: Break-bulk / Ro-Ro (pas conteneur standard)</div>
                <div>• Tarif: {machineVolume >= 3 ? 'Volume (≥3m³)' : 'Base (1m³)'}</div>
                <div>• Frais portuaires: ~170 € (break-bulk)</div>
                <div>• Assurance: ~<Price amount={Math.round((machineValue || 50000) * 0.01 * 0.85)} /> (1% CIF)</div>
                <div>• Conversion USD→EUR: 0.85</div>
              </div>
            </div>
          )}
          
          {/* Détails du transport terrestre */}
          {machineWeight && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Détails du transport terrestre</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Poids: {machineWeight} tonnes</div>
                <div>• Catégorie: {getWeightCategoryText(machineWeight)}</div>
                <div>• Région: {getInlandRegionText(selectedOrigin)}</div>
                <div>• Distance: ~{getInlandDistance(selectedDestination)} km</div>
                <div>• Tarif: ~<Price amount={getInlandRate(machineWeight, selectedOrigin)} />/km</div>
                {(machineWeight >= 50 || selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') && (
                  <div className="text-orange-600 font-medium">
                    • Suppléments: {machineWeight >= 50 ? 'Convoi exceptionnel' : ''}
                    {machineWeight >= 50 && (selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') ? ' + ' : ''}
                    {(selectedDestination === 'Bamako' || selectedDestination === 'Ouagadougou') ? 'Destination intérieure' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note d'information */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Estimation indicative</p>
            <p className="text-xs mt-1">
              Les coûts incluent le transport maritime (tarifs Nile Cargo Carrier), les frais de douane selon les taux officiels, 
              et le transport terrestre (porte-char avec chauffeur). Les prix peuvent varier selon les conditions du marché.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonctions utilitaires pour l'affichage
function getWeightCategory(poids: number): string {
  if (poids < 6) return 'light';
  if (poids < 25) return 'medium';
  if (poids < 35) return 'heavy';
  if (poids < 50) return 'extra';
  return 'exceptional';
}

function getWeightCategoryText(poids: number): string {
  if (poids < 6) return 'Mini-engin (<6T)';
  if (poids < 25) return 'Pelle standard (18-24T)';
  if (poids < 35) return 'Chargeuse (25-30T)';
  if (poids < 50) return 'Concasseur (30-50T)';
  return 'Convoi exceptionnel (>50T)';
}

function getInlandRegionText(origin: string): string {
  if (['Marseille', 'Rotterdam', 'Anvers', 'Hambourg'].includes(origin)) return 'Europe';
  if (['Casablanca', 'Tanger', 'Agadir'].includes(origin)) return 'Maroc';
  return 'Afrique de l\'Ouest';
}

function getInlandDistance(destination: string): number {
  const distances: { [key: string]: number } = {
    'Abidjan': 50, 'Dakar': 30, 'Cotonou': 40, 'Lagos': 60, 
    'Accra': 45, 'Douala': 35, 'Bamako': 1200, 'Ouagadougou': 1100
  };
  return distances[destination] || 50;
}

function getInlandRate(poids: number, origin: string): number {
  const region = getInlandRegionText(origin);
  const category = getWeightCategory(poids);
  
  const rates: { [key: string]: { [key: string]: number } } = {
    'Europe': { 'light': 2.50, 'medium': 3.20, 'heavy': 3.50, 'extra': 4.50, 'exceptional': 8.00 },
    'Maroc': { 'light': 1.80, 'medium': 2.30, 'heavy': 2.60, 'extra': 3.20, 'exceptional': 6.00 },
    'Afrique de l\'Ouest': { 'light': 2.00, 'medium': 2.80, 'heavy': 3.20, 'extra': 4.00, 'exceptional': 7.00 }
  };
  
  return rates[region]?.[category] || 3.00;
} 