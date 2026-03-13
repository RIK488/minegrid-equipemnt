import React from 'react';
import { MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export interface Site {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'warning';
  equipmentCount: number;
}

interface MonitorMapProps {
  sites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
}

const statusConfig = {
  online:  { color: 'bg-green-500',  ring: 'ring-green-200', icon: Wifi,           label: 'En ligne' },
  offline: { color: 'bg-red-500',    ring: 'ring-red-200',   icon: WifiOff,        label: 'Hors ligne' },
  warning: { color: 'bg-amber-500',  ring: 'ring-amber-200', icon: AlertTriangle,  label: 'Alerte' },
};

export default function MonitorMap({ sites, selectedSiteId, onSelectSite }: MonitorMapProps) {
  return (
    <div className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs font-medium flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {sites.length} site{sites.length > 1 ? 's' : ''} actif{sites.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="bg-white/10 backdrop-blur-md rounded-md px-2.5 py-1 text-white text-xs flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${cfg.color}`} />
            {cfg.label}
          </div>
        ))}
      </div>

      <div className="relative h-full flex items-center justify-center p-8">
        <div className="relative w-full max-w-lg aspect-[4/3]">
          {sites.map((site, i) => {
            const cfg = statusConfig[site.status];
            const Icon = cfg.icon;
            const isSelected = site.id === selectedSiteId;

            const positions = [
              { left: '15%', top: '25%' },
              { left: '55%', top: '15%' },
              { left: '75%', top: '45%' },
              { left: '35%', top: '60%' },
              { left: '60%', top: '70%' },
              { left: '20%', top: '50%' },
              { left: '80%', top: '25%' },
              { left: '45%', top: '40%' },
            ];
            const pos = positions[i % positions.length];

            return (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group
                  ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
                style={pos}
                title={site.name}
              >
                <span className={`absolute inset-0 rounded-full ${cfg.color} opacity-30 animate-ping`} />
                <span className={`relative flex items-center justify-center h-10 w-10 rounded-full ${cfg.color} ring-4 ${cfg.ring}
                  ${isSelected ? 'ring-white/50 shadow-lg shadow-white/20' : ''}`}>
                  <Icon className="h-4 w-4 text-white" />
                </span>

                <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap bg-white rounded-md shadow-lg px-2.5 py-1 text-xs font-medium text-slate-800
                  transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {site.name}
                  <span className="block text-[10px] text-slate-400">{site.country} — {site.equipmentCount} machine{site.equipmentCount > 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
