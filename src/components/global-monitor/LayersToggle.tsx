import React from 'react';
import { Layers, Mountain, Route, Zap, FileText, Building2 } from 'lucide-react';

export type LayerKey = 'mine' | 'infrastructure' | 'energy' | 'btp' | 'tender';

interface LayersToggleProps {
  activeLayers: Set<LayerKey>;
  onToggle: (layer: LayerKey) => void;
}

const LAYERS: { key: LayerKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'mine',           label: 'Mines',      icon: Mountain, color: '#f59e0b' },
  { key: 'infrastructure', label: 'Infra',       icon: Route,    color: '#3b82f6' },
  { key: 'energy',         label: 'Énergie',     icon: Zap,      color: '#22c55e' },
  { key: 'btp',            label: 'BTP',         icon: Building2, color: '#f97316' },
  { key: 'tender',         label: 'Appels d\'offres', icon: FileText, color: '#8b5cf6' },
];

export function projectTypeToLayer(type: string | null, phase?: string | null): LayerKey {
  if (!type) return 'infrastructure';
  switch (type) {
    case 'mine': return 'mine';
    case 'energy': return 'energy';
    case 'btp': return 'btp';
    case 'road': case 'port': case 'rail': case 'dam': case 'industrial_zone': return 'infrastructure';
    default: return 'infrastructure';
  }
}

export default function LayersToggle({ activeLayers, onToggle }: LayersToggleProps) {
  return (
    <div className="absolute top-3 right-3 z-[1000] bg-black/60 backdrop-blur-md rounded-lg p-2 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-1.5 py-0.5 text-white/70 text-[10px] font-medium uppercase tracking-wider">
        <Layers className="h-3 w-3" /> Couches
      </div>
      {LAYERS.map(({ key, label, icon: Icon, color }) => {
        const active = activeLayers.has(key);
        const isTender = key === 'tender';
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-all
              ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full border-2 transition-colors"
              style={{
                borderColor: color,
                backgroundColor: isTender ? 'transparent' : (active ? color : 'transparent'),
              }}
            />
            <Icon className="h-3 w-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
