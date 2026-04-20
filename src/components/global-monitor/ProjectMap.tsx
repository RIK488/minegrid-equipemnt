import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { MonitorProject } from '../../types/monitor';
import { PROJECT_TYPE_COLORS, PROJECT_TYPE_LABELS } from '../../types/monitor';
import LayersToggle, { type LayerKey } from './LayersToggle';

interface ProjectMapProps {
  projects: MonitorProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeLayers: Set<LayerKey>;
  onToggleLayer: (layer: LayerKey) => void;
}

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  France: [46.23, 2.21],
  Germany: [51.17, 10.45],
  Spain: [40.46, -3.75],
  Italy: [41.87, 12.57],
  'United Kingdom': [55.38, -3.44],
  Portugal: [39.40, -8.22],
  Netherlands: [52.13, 5.29],
  Belgium: [50.50, 4.47],
  Switzerland: [46.82, 8.23],
  Austria: [47.52, 14.55],
  Greece: [39.07, 21.82],
  Poland: [51.92, 19.15],
  Romania: [45.94, 24.97],
  Morocco: [31.79, -7.09],
  Algeria: [28.03, 1.66],
  Tunisia: [33.89, 9.56],
  Libya: [26.34, 17.23],
  Mauritania: [21.01, -10.94],
  Egypt: [26.82, 30.80],
  'Saudi Arabia': [23.89, 45.08],
  'United Arab Emirates': [24.34, 54.38],
  Qatar: [25.35, 51.18],
  Kuwait: [29.31, 47.48],
  Oman: [21.51, 55.92],
  Bahrain: [26.07, 50.56],
  Jordan: [31.24, 36.51],
  Lebanon: [33.85, 35.86],
  Iraq: [33.22, 43.68],
  Senegal: [14.50, -14.45],
  "Côte d'Ivoire": [7.54, -5.55],
  Cameroon: [5.96, 12.60],
  Nigeria: [9.08, 8.68],
  Ghana: [7.95, -1.02],
  "Burkina Faso": [12.24, -1.56],
  Guinea: [9.95, -9.70],
  Niger: [17.61, 8.08],
  Mali: [17.57, -3.99],
  Congo: [-0.23, 15.83],
};

const COUNTRY_ALIASES: Record<string, string> = {
  maroc: 'Morocco',
  france: 'France',
  allemagne: 'Germany',
  germany: 'Germany',
  espagne: 'Spain',
  spain: 'Spain',
  italie: 'Italy',
  italy: 'Italy',
  "united kingdom": 'United Kingdom',
  uk: 'United Kingdom',
  "royaume-uni": 'United Kingdom',
  "royaume uni": 'United Kingdom',
  portugal: 'Portugal',
  "pays-bas": 'Netherlands',
  "pays bas": 'Netherlands',
  netherlands: 'Netherlands',
  belgique: 'Belgium',
  belgium: 'Belgium',
  suisse: 'Switzerland',
  switzerland: 'Switzerland',
  autriche: 'Austria',
  austria: 'Austria',
  grece: 'Greece',
  grèce: 'Greece',
  greece: 'Greece',
  pologne: 'Poland',
  poland: 'Poland',
  roumanie: 'Romania',
  romania: 'Romania',
  morocco: 'Morocco',
  algerie: 'Algeria',
  algérie: 'Algeria',
  algeria: 'Algeria',
  tunisie: 'Tunisia',
  tunisia: 'Tunisia',
  libye: 'Libya',
  libya: 'Libya',
  mauritanie: 'Mauritania',
  mauritania: 'Mauritania',
  egypte: 'Egypt',
  égypte: 'Egypt',
  egypt: 'Egypt',
  saudi: 'Saudi Arabia',
  "saudi arabia": 'Saudi Arabia',
  arabie: 'Saudi Arabia',
  "arabie saoudite": 'Saudi Arabia',
  uae: 'United Arab Emirates',
  emirates: 'United Arab Emirates',
  "united arab emirates": 'United Arab Emirates',
  "emirats arabes unis": 'United Arab Emirates',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  koweit: 'Kuwait',
  koweït: 'Kuwait',
  oman: 'Oman',
  bahrein: 'Bahrain',
  bahreïn: 'Bahrain',
  bahrain: 'Bahrain',
  jordanie: 'Jordan',
  jordan: 'Jordan',
  liban: 'Lebanon',
  lebanon: 'Lebanon',
  irak: 'Iraq',
  iraq: 'Iraq',
  senegal: 'Senegal',
  sénégal: 'Senegal',
  "cote d'ivoire": "Côte d'Ivoire",
  "côte d'ivoire": "Côte d'Ivoire",
  "cote d ivoire": "Côte d'Ivoire",
  "côte d ivoire": "Côte d'Ivoire",
  cameroun: 'Cameroon',
  cameroon: 'Cameroon',
  nigeria: 'Nigeria',
  ghana: 'Ghana',
  "burkina faso": 'Burkina Faso',
  guinee: 'Guinea',
  guinée: 'Guinea',
  guinea: 'Guinea',
  niger: 'Niger',
  mali: 'Mali',
  congo: 'Congo',
  benin: 'Benin',
  bénin: 'Benin',
  togo: 'Togo',
};

function normalizeCountryName(country: string | null): string | null {
  const c = (country || '').trim();
  if (!c) return null;
  const key = c.toLowerCase();
  return COUNTRY_ALIASES[key] || c;
}

function hashToOffset(input: string): [number, number] {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  const latOff = ((h % 1000) / 1000 - 0.5) * 1.2;
  const lonOff = ((((h / 1000) % 1000) / 1000) - 0.5) * 1.2;
  return [latOff, lonOff];
}

function getProjectCoords(p: MonitorProject): [number, number] | null {
  if (p.lat != null && p.lon != null) return [p.lat, p.lon];
  const normalizedCountry = normalizeCountryName(p.country);
  const base = normalizedCountry ? COUNTRY_CENTROIDS[normalizedCountry] : undefined;
  const seed = p.fingerprint || p.id || p.title || `${p.country}-${p.type || ''}`;
  const [dLat, dLon] = hashToOffset(seed);
  if (base) return [base[0] + dLat, base[1] + dLon];
  // Fallback Afrique: évite de perdre des points si le pays est absent/mal normalisé.
  return [9.5 + dLat * 2.0, 20 + dLon * 2.0];
}

function markerColor(type: string | null): string {
  if (type && PROJECT_TYPE_COLORS[type]) return PROJECT_TYPE_COLORS[type];
  return '#6b7280';
}

function createIcon(type: string | null, phase: string | null, isSelected: boolean) {
  const color = markerColor(type);
  const isTender = phase === 'tender';
  const size = isSelected ? 20 : 12;
  const outer = size + (isTender ? 14 : 10);
  const tenderRingSize = size + 6;
  return L.divIcon({
    className: '',
    iconSize: [outer, outer],
    iconAnchor: [outer / 2, outer / 2],
    html: `
      <div style="position:relative;width:${outer}px;height:${outer}px;display:flex;align-items:center;justify-content:center">
        ${isTender ? `<span style="position:absolute;width:${tenderRingSize}px;height:${tenderRingSize}px;border-radius:50%;border:2px solid #8b5cf6;background:transparent"></span>` : ''}
        <span style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.25;animation:ping 2s cubic-bezier(0,0,.2,1) infinite"></span>
        <span style="position:relative;display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};
          border:2px solid ${isSelected ? '#fff' : color};
          box-shadow:0 0 ${isSelected ? 12 : 4}px ${color}${isSelected ? 'cc' : '66'};transition:all .2s"></span>
      </div>`,
  });
}

function projectLayerByType(type: string | null): LayerKey {
  if (type === 'mine') return 'mine';
  if (type === 'energy') return 'energy';
  if (type === 'btp') return 'btp';
  return 'infrastructure';
}

export default function ProjectMap({ projects, selectedId, onSelect, activeLayers, onToggleLayer }: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const visibleProjects = useMemo(() =>
    projects.filter((p) => {
      if (!getProjectCoords(p)) return false;
      const byType = projectLayerByType(p.type);
      const isTender = p.phase === 'tender';
      // Un projet peut appartenir a sa couche sectorielle et a la couche AO.
      return activeLayers.has(byType) || (isTender && activeLayers.has('tender'));
    }),
  [projects, activeLayers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [8, 10],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    visibleProjects.forEach((p) => {
      const isSelected = p.id === selectedId;
      const coords = getProjectCoords(p);
      if (!coords) return;
      const marker = L.marker(coords, { icon: createIcon(p.type, p.phase, isSelected) });

      const color = markerColor(p.type);
      const typeLabel = PROJECT_TYPE_LABELS[p.type || ''] || p.type || '—';
      const budget = p.budget_usd ? `$${(p.budget_usd / 1e6).toFixed(0)}M` : '—';

      const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
      marker.bindTooltip(
        `<div style="font-family:system-ui;min-width:140px">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${esc(p.title)}</div>
          <div style="font-size:11px;color:#94a3b8">${esc(p.country)} ${p.region ? '— ' + esc(p.region) : ''}</div>
          <div style="margin-top:5px;display:flex;align-items:center;gap:6px;font-size:11px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span>
            ${esc(typeLabel)} · ${esc(budget)}
          </div>
        </div>`,
        { direction: 'top', offset: [0, -10], className: 'monitor-tooltip' }
      );
      marker.on('click', () => onSelect(p.id));
      marker.addTo(map);
      markersRef.current.set(p.id, marker);
    });
  }, [visibleProjects, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = visibleProjects.find((x) => x.id === selectedId);
    const coords = p ? getProjectCoords(p) : null;
    if (coords) {
      map.flyTo(coords, 7, { duration: 0.8 });
    }
  }, [selectedId, visibleProjects]);

  return (
    <div className="relative h-full rounded-xl overflow-hidden border border-gray-700/30">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute top-3 left-3 z-[1000]">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs font-medium flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {visibleProjects.length} projet{visibleProjects.length > 1 ? 's' : ''}
        </div>
      </div>

      <LayersToggle activeLayers={activeLayers} onToggle={onToggleLayer} />

      <style>{`
        @keyframes ping { 75%,100% { transform:scale(2.2); opacity:0 } }
        .monitor-tooltip { background:#fff !important; border:1px solid #e2e8f0 !important; border-radius:8px !important; padding:8px 10px !important; box-shadow:0 4px 12px rgba(0,0,0,.15) !important }
        .monitor-tooltip::before { border-top-color:#fff !important }
        .leaflet-control-zoom a { background:rgba(0,0,0,.6) !important; color:#fff !important; border-color:rgba(255,255,255,.1) !important; backdrop-filter:blur(8px) }
        .leaflet-control-zoom a:hover { background:rgba(0,0,0,.8) !important }
      `}</style>
    </div>
  );
}
