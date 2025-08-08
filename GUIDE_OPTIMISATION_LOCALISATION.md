# 🗺️ GUIDE COMPLET : Optimisation de la Localisation avec Google Maps

## 🎯 **OBJECTIFS D'OPTIMISATION**

### **✅ Fonctionnalités à implémenter :**
1. **Coordonnées GPS** : Latitude/Longitude dans la base de données
2. **Interface Google Maps** : Sélection visuelle de l'emplacement
3. **Géolocalisation automatique** : Détection de la position actuelle
4. **Recherche géographique** : Filtrage par distance/zone
5. **Carte interactive** : Affichage des équipements sur une carte

---

## 🗄️ **ÉTAPE 1 : MODIFICATION DE LA BASE DE DONNÉES**

### **Script SQL pour ajouter les champs GPS :**

```sql
-- =====================================================
-- AJOUT DES CHAMPS GPS À LA TABLE MACHINES
-- =====================================================

-- Ajouter les champs de coordonnées GPS
ALTER TABLE machines ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE machines ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE machines ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Créer un index géospatial pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_machines_location ON machines USING GIST (
    ll_to_earth(latitude, longitude)
);

-- Fonction pour calculer la distance entre deux points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN earth_distance(
        ll_to_earth(lat1, lng1),
        ll_to_earth(lat2, lng2)
    ) / 1000; -- Retourne la distance en kilomètres
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 **ÉTAPE 2 : COMPOSANT GOOGLE MAPS**

### **Installation des dépendances :**

```bash
npm install @googlemaps/js-api-loader react-google-maps-api
```

### **Composant LocationPicker :**

```tsx
// src/components/LocationPicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Search, X } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
    postal_code: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const initialPosition = initialLocation 
          ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
          : { lat: 33.5731, lng: -7.5898 }; // Casablanca par défaut

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialPosition,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);

        // Ajouter un marqueur initial si une position est fournie
        if (initialLocation) {
          const markerInstance = new google.maps.Marker({
            position: initialPosition,
            map: mapInstance,
            draggable: true,
            title: 'Emplacement sélectionné'
          });
          setMarker(markerInstance);
        }

        // Gestionnaire de clic sur la carte
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          const position = event.latLng;
          if (position) {
            updateMarker(position);
            reverseGeocode(position);
          }
        });
      }
    });
  }, [initialLocation]);

  const updateMarker = (position: google.maps.LatLng) => {
    if (marker) {
      marker.setPosition(position);
    } else {
      const newMarker = new google.maps.Marker({
        position,
        map,
        draggable: true,
        title: 'Emplacement sélectionné'
      });
      setMarker(newMarker);
    }
  };

  const reverseGeocode = async (position: google.maps.LatLng) => {
    setIsLoading(true);
    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ location: position });
      if (response.results[0]) {
        const result = response.results[0];
        const addressComponents = result.address_components;
        
        const locationData = {
          latitude: position.lat(),
          longitude: position.lng(),
          address: result.formatted_address,
          city: extractAddressComponent(addressComponents, 'locality') || '',
          country: extractAddressComponent(addressComponents, 'country') || '',
          postal_code: extractAddressComponent(addressComponents, 'postal_code') || ''
        };

        onLocationSelect(locationData);
        setSearchQuery(result.formatted_address);
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractAddressComponent = (components: google.maps.GeocoderAddressComponent[], type: string) => {
    const component = components.find(comp => 
      comp.types.includes(type)
    );
    return component ? component.long_name : '';
  };

  const handleSearch = () => {
    if (!map || !searchQuery) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const position = results[0].geometry.location;
        map.setCenter(position);
        map.setZoom(15);
        updateMarker(position);
        reverseGeocode(position);
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map?.setCenter(pos);
          map?.setZoom(15);
          updateMarker(pos);
          reverseGeocode(pos);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchBoxRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher une adresse..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Rechercher
        </button>
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          title="Ma position actuelle"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Carte */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Cliquez sur la carte pour sélectionner l'emplacement ou utilisez la barre de recherche
        </p>
      </div>
    </div>
  );
}
```

---

## 🔧 **ÉTAPE 3 : INTÉGRATION DANS LES FORMULAIRES**

### **Modification de SellEquipment.tsx :**

```tsx
// Ajouter dans les imports
import LocationPicker from '../components/LocationPicker';

// Ajouter dans le state
const [locationData, setLocationData] = useState({
  latitude: null,
  longitude: null,
  address: '',
  city: '',
  country: '',
  postal_code: ''
});

// Ajouter dans le formulaire
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4">Localisation</h2>
  
  <LocationPicker
    onLocationSelect={setLocationData}
    initialLocation={locationData.latitude ? {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address
    } : undefined}
  />
  
  {/* Affichage des coordonnées sélectionnées */}
  {locationData.latitude && (
    <div className="mt-4 p-3 bg-green-50 rounded-lg">
      <h4 className="font-medium text-green-800 mb-2">Emplacement sélectionné :</h4>
      <p className="text-sm text-green-700">{locationData.address}</p>
      <p className="text-xs text-green-600 mt-1">
        Coordonnées : {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
      </p>
    </div>
  )}
</div>
```

---

## 🗺️ **ÉTAPE 4 : CARTE INTERACTIVE DES ÉQUIPEMENTS**

### **Composant EquipmentMap :**

```tsx
// src/components/EquipmentMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Info, Navigation } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  latitude: number;
  longitude: number;
  address: string;
}

interface EquipmentMapProps {
  equipment: Equipment[];
  onEquipmentSelect?: (equipment: Equipment) => void;
}

export default function EquipmentMap({ equipment, onEquipmentSelect }: EquipmentMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 33.5731, lng: -7.5898 }, // Casablanca
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        setMap(mapInstance);
      }
    });
  }, []);

  useEffect(() => {
    if (map && equipment.length > 0) {
      // Supprimer les anciens marqueurs
      markers.forEach(marker => marker.setMap(null));

      const newMarkers: google.maps.Marker[] = [];
      const bounds = new google.maps.LatLngBounds();

      equipment.forEach((item) => {
        if (item.latitude && item.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: item.latitude, lng: item.longitude },
            map,
            title: item.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#F97316"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32)
            }
          });

          // Info window pour chaque marqueur
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 max-w-xs">
                <h3 class="font-semibold text-gray-900">${item.name}</h3>
                <p class="text-sm text-gray-600">${item.brand} ${item.model}</p>
                <p class="text-lg font-bold text-orange-600">${item.price.toLocaleString()} €</p>
                <p class="text-xs text-gray-500">${item.address}</p>
                <button onclick="window.selectEquipment('${item.id}')" class="mt-2 px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                  Voir détails
                </button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            setSelectedEquipment(item);
          });

          newMarkers.push(marker);
          bounds.extend({ lat: item.latitude, lng: item.longitude });
        }
      });

      setMarkers(newMarkers);
      map.fitBounds(bounds);
    }
  }, [map, equipment]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Carte des équipements ({equipment.length})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (map && equipment.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                equipment.forEach(item => {
                  if (item.latitude && item.longitude) {
                    bounds.extend({ lat: item.latitude, lng: item.longitude });
                  }
                });
                map.fitBounds(bounds);
              }
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Voir tout
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-gray-300"
      />

      {selectedEquipment && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Équipement sélectionné
          </h4>
          <p className="text-sm text-gray-600">
            {selectedEquipment.name} - {selectedEquipment.brand} {selectedEquipment.model}
          </p>
          <p className="text-lg font-bold text-orange-600">
            {selectedEquipment.price.toLocaleString()} €
          </p>
          <p className="text-xs text-gray-500">
            {selectedEquipment.address}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 **ÉTAPE 5 : RECHERCHE GÉOGRAPHIQUE**

### **Filtres de distance :**

```tsx
// src/components/LocationFilter.tsx
import React, { useState } from 'react';
import { MapPin, Navigation, Sliders } from 'lucide-react';

interface LocationFilterProps {
  onFilterChange: (filters: {
    radius: number;
    centerLat: number;
    centerLng: number;
  }) => void;
}

export default function LocationFilter({ onFilterChange }: LocationFilterProps) {
  const [radius, setRadius] = useState(50);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onFilterChange({
            radius,
            centerLat: latitude,
            centerLng: longitude
          });
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <Sliders className="h-4 w-4 mr-2" />
        Filtres de localisation
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rayon de recherche
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="5"
              max="500"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-12">{radius} km</span>
          </div>
        </div>

        <button
          onClick={getCurrentLocation}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Utiliser ma position actuelle
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 **ÉTAPE 6 : CONFIGURATION GOOGLE MAPS API**

### **Variables d'environnement :**

```env
# .env
VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_google_maps
```

### **Activation des services Google Maps :**
1. **Maps JavaScript API**
2. **Places API**
3. **Geocoding API**

---

## 📊 **AVANTAGES DE CETTE OPTIMISATION**

### **✅ Pour les vendeurs :**
- **Précision** : Localisation exacte de l'équipement
- **Visibilité** : Apparition sur la carte interactive
- **Facilité** : Sélection visuelle de l'emplacement

### **✅ Pour les acheteurs :**
- **Recherche géographique** : Trouver des équipements près de chez soi
- **Visualisation** : Voir l'emplacement exact sur la carte
- **Distance** : Calcul automatique des distances

### **✅ Pour la plateforme :**
- **Expérience utilisateur** : Interface moderne et intuitive
- **Données précises** : Coordonnées GPS fiables
- **Fonctionnalités avancées** : Recherche par zone, filtres géographiques

---

## 🎯 **PROCHAINES ÉTAPES**

1. **Implémenter** le composant LocationPicker
2. **Intégrer** dans les formulaires existants
3. **Ajouter** la carte interactive des équipements
4. **Configurer** l'API Google Maps
5. **Tester** la géolocalisation et les filtres

**Cette optimisation va considérablement améliorer l'expérience utilisateur et la précision des localisations !** 🗺️ 