import React, { useState, useMemo } from 'react';
import { Globe, RefreshCw, Filter, Wifi, WifiOff, AlertTriangle, Search } from 'lucide-react';
import MonitorMap from '../components/global-monitor/MonitorMap';
import SiteList from '../components/global-monitor/SiteList';
import EquipmentDetail from '../components/global-monitor/EquipmentDetail';
import type { Site } from '../components/global-monitor/MonitorMap';
import type { Equipment } from '../components/global-monitor/EquipmentDetail';

const DEMO_SITES: Site[] = [
  { id: 's1', name: 'Mine de Kédougou',       country: 'Sénégal',     lat: 12.56, lng: -12.18, status: 'online',  equipmentCount: 5 },
  { id: 's2', name: 'Carrière de Douala',      country: 'Cameroun',    lat: 4.05,  lng: 9.70,   status: 'online',  equipmentCount: 3 },
  { id: 's3', name: 'Chantier Abidjan Nord',   country: 'Côte d\'Ivoire', lat: 5.36, lng: -4.01, status: 'warning', equipmentCount: 4 },
  { id: 's4', name: 'Site de Ouagadougou',     country: 'Burkina Faso', lat: 12.37, lng: -1.52, status: 'online',  equipmentCount: 2 },
  { id: 's5', name: 'Mine de Siguiri',         country: 'Guinée',      lat: 11.42, lng: -9.17,  status: 'offline', equipmentCount: 3 },
  { id: 's6', name: 'Projet routier Niamey',   country: 'Niger',       lat: 13.51, lng: 2.11,   status: 'online',  equipmentCount: 2 },
];

const DEMO_EQUIPMENT: Record<string, Equipment[]> = {
  s1: [
    { id: 'e1', name: 'Pelle CAT 390F',     model: 'Caterpillar 390F L',  status: 'running',     hoursUsed: 4520, fuelLevel: 72, temperature: 85,  nextMaintenance: '2026-04-10', efficiency: 91 },
    { id: 'e2', name: 'Chargeuse CAT 980M',  model: 'Caterpillar 980M',   status: 'running',     hoursUsed: 3280, fuelLevel: 55, temperature: 78,  nextMaintenance: '2026-03-28', efficiency: 88 },
    { id: 'e3', name: 'Tombereau 777G',      model: 'Caterpillar 777G',   status: 'idle',        hoursUsed: 6100, fuelLevel: 40, temperature: 42,  nextMaintenance: '2026-05-02', efficiency: 85 },
    { id: 'e4', name: 'Foreuse Atlas DM30',  model: 'Atlas Copco DM30',   status: 'maintenance', hoursUsed: 2750, fuelLevel: 30, temperature: 38,  nextMaintenance: '2026-03-15', efficiency: 0  },
    { id: 'e5', name: 'Concasseur Metso C120', model: 'Metso C120',       status: 'running',     hoursUsed: 5600, fuelLevel: 68, temperature: 92,  nextMaintenance: '2026-04-22', efficiency: 94 },
  ],
  s2: [
    { id: 'e6', name: 'Grue Liebherr LTM',   model: 'Liebherr LTM 1300', status: 'running', hoursUsed: 1890, fuelLevel: 80, temperature: 65, nextMaintenance: '2026-06-01', efficiency: 92 },
    { id: 'e7', name: 'Bétonnière Schwing',   model: 'Schwing SP 500',    status: 'idle',    hoursUsed: 950,  fuelLevel: 90, temperature: 35, nextMaintenance: '2026-07-15', efficiency: 87 },
    { id: 'e8', name: 'Niveleuse CAT 14M3',   model: 'Caterpillar 14M3',  status: 'running', hoursUsed: 2100, fuelLevel: 62, temperature: 74, nextMaintenance: '2026-04-18', efficiency: 89 },
  ],
  s3: [
    { id: 'e9',  name: 'Bulldozer D8T',       model: 'Caterpillar D8T',   status: 'running',     hoursUsed: 3500, fuelLevel: 45, temperature: 88, nextMaintenance: '2026-03-20', efficiency: 83 },
    { id: 'e10', name: 'Compacteur CS56',      model: 'Caterpillar CS56',  status: 'stopped',     hoursUsed: 1500, fuelLevel: 15, temperature: 105, nextMaintenance: '2026-03-14', efficiency: 0  },
    { id: 'e11', name: 'Pelle Komatsu PC200',  model: 'Komatsu PC200-8',   status: 'running',     hoursUsed: 4100, fuelLevel: 58, temperature: 82, nextMaintenance: '2026-05-10', efficiency: 90 },
    { id: 'e12', name: 'Camion benne Volvo',    model: 'Volvo FMX 500',     status: 'maintenance', hoursUsed: 6800, fuelLevel: 22, temperature: 40, nextMaintenance: '2026-03-16', efficiency: 0  },
  ],
  s4: [
    { id: 'e13', name: 'Chargeuse Volvo L150H', model: 'Volvo L150H',  status: 'running', hoursUsed: 2200, fuelLevel: 70, temperature: 72, nextMaintenance: '2026-06-20', efficiency: 91 },
    { id: 'e14', name: 'Pelle Doosan DX225',    model: 'Doosan DX225', status: 'idle',    hoursUsed: 1800, fuelLevel: 85, temperature: 38, nextMaintenance: '2026-05-30', efficiency: 86 },
  ],
  s5: [
    { id: 'e15', name: 'Foreuse Sandvik DR461i', model: 'Sandvik DR461i', status: 'stopped', hoursUsed: 5200, fuelLevel: 10, temperature: 30, nextMaintenance: '2026-03-18', efficiency: 0 },
    { id: 'e16', name: 'Tombereau Komatsu 830E', model: 'Komatsu 830E',   status: 'stopped', hoursUsed: 7800, fuelLevel: 5,  temperature: 28, nextMaintenance: '2026-03-22', efficiency: 0 },
    { id: 'e17', name: 'Concasseur Sandvik CJ412', model: 'Sandvik CJ412', status: 'stopped', hoursUsed: 4600, fuelLevel: 8,  temperature: 32, nextMaintenance: '2026-04-05', efficiency: 0 },
  ],
  s6: [
    { id: 'e18', name: 'Niveleuse John Deere 872GP', model: 'JD 872GP',      status: 'running', hoursUsed: 1300, fuelLevel: 78, temperature: 68, nextMaintenance: '2026-07-01', efficiency: 93 },
    { id: 'e19', name: 'Compacteur Bomag BW226',     model: 'Bomag BW226DI', status: 'running', hoursUsed: 900,  fuelLevel: 82, temperature: 60, nextMaintenance: '2026-08-15', efficiency: 95 },
  ],
};

type StatusFilter = 'all' | 'online' | 'offline' | 'warning';

export default function GlobalMonitor() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(() => {
    return DEMO_SITES.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.country.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, searchQuery]);

  const selectedSite = DEMO_SITES.find((s) => s.id === selectedSiteId) ?? null;
  const selectedEquipment = selectedSiteId ? (DEMO_EQUIPMENT[selectedSiteId] ?? []) : [];

  const stats = useMemo(() => ({
    total:   DEMO_SITES.length,
    online:  DEMO_SITES.filter((s) => s.status === 'online').length,
    warning: DEMO_SITES.filter((s) => s.status === 'warning').length,
    offline: DEMO_SITES.filter((s) => s.status === 'offline').length,
    machines: Object.values(DEMO_EQUIPMENT).flat().length,
  }), []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Minegrid Global Monitor</h1>
              <p className="text-xs text-gray-500">Supervision en temps réel de vos sites et équipements</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats pills */}
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                <Wifi className="h-3 w-3" /> {stats.online} en ligne
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" /> {stats.warning} alerte{stats.warning > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                <WifiOff className="h-3 w-3" /> {stats.offline} hors ligne
              </span>
            </div>

            <button
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-1.5">
            {(['all', 'online', 'warning', 'offline'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                  ${statusFilter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f === 'all' ? 'Tous' : f === 'online' ? 'En ligne' : f === 'warning' ? 'Alertes' : 'Hors ligne'}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un site..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1600px] mx-auto px-6 py-5">
        <div className="grid grid-cols-12 gap-5 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Left: site list */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3 overflow-hidden">
            <SiteList
              sites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
            />
          </div>

          {/* Center: map */}
          <div className="col-span-12 md:col-span-5 lg:col-span-6 overflow-hidden">
            <MonitorMap
              sites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
            />
          </div>

          {/* Right: equipment detail */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 overflow-hidden">
            <EquipmentDetail
              site={selectedSite}
              equipment={selectedEquipment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
