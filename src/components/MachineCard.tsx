import React, { useEffect, useState } from 'react';
import type { Machine } from '../types';
import { MapPin, Star, Calendar, Wrench } from 'lucide-react';
import Price from './Price';
import supabase from '../utils/supabaseClient';

interface MachineCardProps {
  machine: Machine;
}

export default function MachineCard({ machine }: MachineCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(machine.images) && machine.images.length > 0) {
      const path = machine.images[0];
      if (path) {
        const { data } = supabase.storage
          .from('machine-image')
          .getPublicUrl(path);
        
        if (data && data.publicUrl) {
          setImageUrl(data.publicUrl);
        }
      }
    }
  }, [machine.id, machine.images]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <a href={`#machines/${machine.id}`} className="block">
        <div className="relative h-48 bg-gray-200 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={machine.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">Image non disponible</span>
          )}
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm capitalize">
            {machine.condition === 'new' ? 'Neuf' : 'Occasion'}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
            <p className="text-sm text-gray-600">{machine.model}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{machine.year}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Wrench className="h-4 w-4 mr-1" />
              <span>
                {machine.specifications.power?.value && machine.specifications.power?.unit 
                  ? `${machine.specifications.power.value} ${machine.specifications.power.unit}`
                  : 'Non spécifié'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{machine.seller?.location ?? 'Localisation inconnue'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{machine.seller?.rating ?? '-'}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div className="text-center sm:text-left">
    <Price 
      amount={machine.price}
      showOriginal={true}
      className="text-lg sm:text-xl font-bold text-primary-600"
    />
  </div>
  <div
    className="w-full sm:w-auto text-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors cursor-pointer"
  >
    Détails
  </div>
</div>


        </div>
      </a>
    </div>
  );
}
