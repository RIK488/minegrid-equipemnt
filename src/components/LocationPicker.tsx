import React, { useState, useEffect, useRef } from 'react';
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
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Charger Google Maps de manière dynamique
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const initialPosition = initialLocation 
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : { lat: 33.5731, lng: -7.5898 }; // Casablanca par défaut

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
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
      const markerInstance = new window.google.maps.Marker({
        position: initialPosition,
        map: mapInstance,
        draggable: true,
        title: 'Emplacement sélectionné'
      });
      setMarker(markerInstance);
    }

    // Gestionnaire de clic sur la carte
    mapInstance.addListener('click', (event: any) => {
      const position = event.latLng;
      if (position) {
        updateMarker(position);
        reverseGeocode(position);
      }
    });
  };

  const updateMarker = (position: any) => {
    if (marker) {
      marker.setPosition(position);
    } else if (map) {
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        draggable: true,
        title: 'Emplacement sélectionné'
      });
      setMarker(newMarker);
    }
  };

  const reverseGeocode = async (position: any) => {
    if (!window.google) return;
    
    setIsLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    
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

  const extractAddressComponent = (components: any[], type: string) => {
    const component = components.find(comp => 
      comp.types.includes(type)
    );
    return component ? component.long_name : '';
  };

  const handleSearch = () => {
    if (!map || !searchQuery || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
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

  // Fallback si Google Maps n'est pas disponible
  if (!mapLoaded && !window.google) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Entrez l'adresse manuellement..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              // Simulation de sélection d'emplacement
              const mockLocation = {
                latitude: 33.5731,
                longitude: -7.5898,
                address: searchQuery || 'Casablanca, Maroc',
                city: 'Casablanca',
                country: 'Maroc',
                postal_code: '20000'
              };
              onLocationSelect(mockLocation);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Valider
          </button>
        </div>
        
        <div className="bg-gray-100 h-96 rounded-lg border border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Carte en cours de chargement...</p>
            <p className="text-sm text-gray-500 mt-2">
              Entrez l'adresse manuellement en attendant
            </p>
          </div>
        </div>
      </div>
    );
  }

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