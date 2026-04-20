import React from 'react';
import {
  Activity, FileText, Users, Wrench, MapPin, Calendar, DollarSign,
  ExternalLink, Loader2, AlertCircle, TrendingUp,
} from 'lucide-react';
import type { MonitorProjectDetail, EquipmentNeed } from '../../types/monitor';
import { PROJECT_TYPE_LABELS, PROJECT_PHASE_LABELS, PROJECT_TYPE_COLORS } from '../../types/monitor';

interface ProjectDetailsProps {
  project: MonitorProjectDetail | null;
  loading: boolean;
}

type EqTemplate = {
  category: string;
  weight: number;
  phases?: Array<'study' | 'financing' | 'tender' | 'construction' | 'ops'>;
};

const TYPE_EQUIPMENT_TEMPLATES: Record<string, EqTemplate[]> = {
  energy: [
    { category: 'grue_mobile', weight: 1.3, phases: ['construction'] },
    { category: 'nacelle', weight: 1.1, phases: ['construction', 'ops'] },
    { category: 'camion_benne', weight: 1.2, phases: ['construction'] },
    { category: 'chargeuse', weight: 0.9, phases: ['construction'] },
    { category: 'chariot_telecopique', weight: 1.1, phases: ['construction', 'ops'] },
    { category: 'compresseur', weight: 0.7, phases: ['construction', 'ops'] },
  ],
  mine: [
    { category: 'excavatrice', weight: 1.4, phases: ['construction', 'ops'] },
    { category: 'camion_benne', weight: 1.5, phases: ['construction', 'ops'] },
    { category: 'bulldozer', weight: 1.2, phases: ['construction', 'ops'] },
    { category: 'forage', weight: 1.1, phases: ['study', 'construction', 'ops'] },
    { category: 'chargeuse', weight: 1.3, phases: ['construction', 'ops'] },
    { category: 'niveleuse', weight: 0.8, phases: ['construction'] },
  ],
  btp: [
    { category: 'pelle_hydraulique', weight: 1.3, phases: ['construction'] },
    { category: 'grue_mobile', weight: 1.1, phases: ['construction'] },
    { category: 'betonniere', weight: 1.0, phases: ['construction'] },
    { category: 'compacteur', weight: 1.0, phases: ['construction'] },
    { category: 'camion_benne', weight: 1.2, phases: ['construction'] },
    { category: 'nacelle', weight: 0.9, phases: ['construction', 'ops'] },
  ],
  infrastructure: [
    { category: 'pelle_hydraulique', weight: 1.1, phases: ['construction'] },
    { category: 'niveleuse', weight: 1.1, phases: ['construction'] },
    { category: 'compacteur', weight: 1.0, phases: ['construction'] },
    { category: 'camion_benne', weight: 1.2, phases: ['construction'] },
    { category: 'grue_mobile', weight: 0.9, phases: ['construction'] },
  ],
  road: [
    { category: 'niveleuse', weight: 1.4, phases: ['construction'] },
    { category: 'compacteur', weight: 1.3, phases: ['construction'] },
    { category: 'finisseur', weight: 1.2, phases: ['construction'] },
    { category: 'camion_benne', weight: 1.2, phases: ['construction'] },
    { category: 'pelle_hydraulique', weight: 0.9, phases: ['construction'] },
  ],
  rail: [
    { category: 'grue_mobile', weight: 1.2, phases: ['construction'] },
    { category: 'niveleuse', weight: 0.9, phases: ['construction'] },
    { category: 'compacteur', weight: 0.8, phases: ['construction'] },
    { category: 'camion_benne', weight: 1.1, phases: ['construction'] },
    { category: 'chariot_telecopique', weight: 0.9, phases: ['construction', 'ops'] },
  ],
  port: [
    { category: 'grue_mobile', weight: 1.5, phases: ['construction', 'ops'] },
    { category: 'chariot_telecopique', weight: 1.2, phases: ['construction', 'ops'] },
    { category: 'camion_benne', weight: 0.9, phases: ['construction'] },
    { category: 'compacteur', weight: 0.8, phases: ['construction'] },
  ],
};

const KEYWORD_BOOSTS: Record<string, Array<{ keyword: string; category: string; boost: number }>> = {
  global: [
    { keyword: 'solar', category: 'nacelle', boost: 0.4 },
    { keyword: 'éolien', category: 'grue_mobile', boost: 0.5 },
    { keyword: 'hydro', category: 'forage', boost: 0.3 },
    { keyword: 'tunnel', category: 'forage', boost: 0.6 },
    { keyword: 'route', category: 'finisseur', boost: 0.6 },
    { keyword: 'road', category: 'finisseur', boost: 0.6 },
    { keyword: 'mine', category: 'excavatrice', boost: 0.6 },
    { keyword: 'mining', category: 'camion_benne', boost: 0.5 },
    { keyword: 'cement', category: 'betonniere', boost: 0.5 },
    { keyword: 'construction', category: 'pelle_hydraulique', boost: 0.3 },
  ],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function machineScaleFromBudget(budgetUsd: number | null): number {
  if (!budgetUsd || budgetUsd <= 0) return 1;
  if (budgetUsd < 5e6) return 0.7;
  if (budgetUsd < 20e6) return 1;
  if (budgetUsd < 80e6) return 1.35;
  if (budgetUsd < 250e6) return 1.8;
  if (budgetUsd < 800e6) return 2.4;
  return 3.2;
}

function phaseMultiplier(phase: string | null): number {
  switch (phase) {
    case 'study': return 0.25;
    case 'financing': return 0.35;
    case 'tender': return 0.6;
    case 'construction': return 1;
    case 'ops': return 0.55;
    default: return 0.75;
  }
}

function normalizeEquipment(equipment: EquipmentNeed[]): EquipmentNeed[] {
  const normalized = equipment
    .filter((eq) => !!eq.category)
    .map((eq) => {
      const minRaw = eq.qty_min ?? eq.qty_max ?? 1;
      const maxRaw = eq.qty_max ?? eq.qty_min ?? minRaw;
      const min = Math.max(1, Math.round(Math.min(minRaw, maxRaw)));
      const max = Math.max(min, Math.round(Math.max(minRaw, maxRaw)));
      return {
        ...eq,
        qty_min: min,
        qty_max: max,
      };
    });

  const seen = new Map<string, EquipmentNeed>();
  normalized.forEach((eq) => {
    const key = (eq.category || '').toLowerCase();
    const prev = seen.get(key);
    if (!prev) {
      seen.set(key, eq);
      return;
    }
    seen.set(key, {
      ...eq,
      id: prev.id,
      qty_min: Math.min(prev.qty_min || 1, eq.qty_min || 1),
      qty_max: Math.max(prev.qty_max || 1, eq.qty_max || 1),
      confidence: Math.max(prev.confidence ?? 0.5, eq.confidence ?? 0.5),
    });
  });
  return Array.from(seen.values());
}

function inferEquipmentNeeds(project: MonitorProjectDetail): EquipmentNeed[] {
  const projectType = (project.type || 'infrastructure').toLowerCase();
  const phase = project.phase as 'study' | 'financing' | 'tender' | 'construction' | 'ops' | null;
  const templates = TYPE_EQUIPMENT_TEMPLATES[projectType] || TYPE_EQUIPMENT_TEMPLATES.infrastructure;

  const text = [
    project.title || '',
    project.source || '',
    ...project.documents.map((d) => d.title || ''),
    ...project.entities.map((e) => `${e.name || ''} ${e.role || ''}`),
  ].join(' ').toLowerCase();

  const keywordBoost = new Map<string, number>();
  KEYWORD_BOOSTS.global.forEach(({ keyword, category, boost }) => {
    if (text.includes(keyword)) {
      keywordBoost.set(category, (keywordBoost.get(category) || 0) + boost);
    }
  });

  const scale = machineScaleFromBudget(project.budget_usd) * phaseMultiplier(phase);
  const confidenceBase = project.budget_usd ? 0.72 : 0.62;

  return templates
    .filter((t) => !t.phases || !phase || t.phases.includes(phase))
    .map((t, idx) => {
      const boost = keywordBoost.get(t.category) || 0;
      const weighted = (t.weight + boost) * scale;
      const qtyMin = clamp(Math.floor(weighted), 1, 120);
      const qtyMax = clamp(Math.ceil(weighted * 1.8), qtyMin, 180);
      const confidence = clamp(confidenceBase + Math.min(0.2, boost * 0.25), 0.55, 0.93);
      return {
        id: `inferred-${t.category}-${idx}`,
        category: t.category,
        qty_min: qtyMin,
        qty_max: qtyMax,
        confidence,
        rationale: '[estimated] estimation basée sur type, phase, budget et texte du projet',
        created_at: new Date().toISOString(),
      } as EquipmentNeed;
    })
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 6);
}

function computeEquipmentForDisplay(project: MonitorProjectDetail): EquipmentNeed[] {
  const normalizedExisting = normalizeEquipment(project.equipment_needs || []);
  if (normalizedExisting.length >= 3) return normalizedExisting;

  const inferred = inferEquipmentNeeds(project);
  const merged = normalizeEquipment([...normalizedExisting, ...inferred]);
  return merged.slice(0, 8);
}

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConfidenceBadge({ confidence, isEstimated }: { confidence: number | null; isEstimated: boolean }) {
  const pct = Math.round((confidence ?? 0.5) * 100);
  let bg = 'bg-green-100 text-green-700';
  if (pct < 50) bg = 'bg-red-100 text-red-700';
  else if (pct < 70) bg = 'bg-amber-100 text-amber-700';

  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${bg}`}>
      {isEstimated ? 'estimé' : ''} {pct}%
    </span>
  );
}

function EquipmentCard({ eq }: { eq: EquipmentNeed }) {
  const isEstimated = (eq.rationale || '').includes('[estimated]') || (eq.rationale || '').includes('[LLM]');
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Wrench className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-700 capitalize">{eq.category?.replace('_', ' ')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-800">{eq.qty_min}–{eq.qty_max}</span>
        <ConfidenceBadge confidence={eq.confidence} isEstimated={isEstimated} />
      </div>
    </div>
  );
}

export default function ProjectDetails({ project, loading }: ProjectDetailsProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl border border-gray-200">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 p-6 text-center">
        <Activity className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">Sélectionnez un projet</p>
        <p className="text-xs text-gray-400 mt-1">pour voir le détail</p>
      </div>
    );
  }

  const color = (project.type && PROJECT_TYPE_COLORS[project.type])
    ? PROJECT_TYPE_COLORS[project.type]
    : '#6b7280';
  const budget = project.budget_usd
    ? project.budget_usd >= 1e9 ? `$${(project.budget_usd / 1e9).toFixed(1)}B` : `$${(project.budget_usd / 1e6).toFixed(0)}M`
    : null;
  const sourceKind = (project.source || '').toLowerCase().startsWith('public portal')
    ? 'Public'
    : (project.source || '').toLowerCase().startsWith('mdb -')
      ? 'MDB'
      : 'Autre';
  const equipmentForDisplay = computeEquipmentForDisplay(project);
  const equipmentDatesSorted = equipmentForDisplay
    .map((eq) => eq.created_at)
    .filter(Boolean)
    .sort();
  const equipmentUpdatedAt =
    equipmentDatesSorted.length > 0
      ? equipmentDatesSorted[equipmentDatesSorted.length - 1]
      : undefined;
  const equipmentUpdatedAtLabel = formatDateTime(equipmentUpdatedAt);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-3 w-3 rounded-full flex-shrink-0" style={{ background: color }} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 leading-tight">{project.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {project.type && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                  {PROJECT_TYPE_LABELS[project.type] || project.type}
                </span>
              )}
              {project.phase && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  project.phase === 'tender'
                    ? 'border-2 border-violet-500 text-violet-700 bg-transparent'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {PROJECT_PHASE_LABELS[project.phase] || project.phase}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2">
          {project.country && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3 w-3 text-gray-400" /> {project.country}{project.region ? `, ${project.region}` : ''}
            </div>
          )}
          {budget && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <DollarSign className="h-3 w-3 text-gray-400" /> {budget}
            </div>
          )}
          {project.start_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="h-3 w-3 text-gray-400" /> {project.start_date}
            </div>
          )}
          {project.confidence != null && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 text-gray-400" /> Confiance {Math.round(project.confidence * 100)}%
            </div>
          )}
        </div>

        {project.source_url && (
          <a href={project.source_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
            <ExternalLink className="h-3 w-3" /> Source : {project.source || 'Lien'} ({sourceKind})
          </a>
        )}

        {/* Documents */}
        {project.documents.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Documents ({project.documents.length})
            </h4>
            <div className="space-y-1">
              {project.documents.map((doc) => (
                <a key={doc.id} href={doc.url || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-700 hover:text-primary-600 py-1">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="truncate">{doc.title || 'Document'}</span>
                  {doc.doc_type && <span className="text-[10px] text-gray-400">({doc.doc_type})</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Entities */}
        {project.entities.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Acteurs ({project.entities.length})
            </h4>
            <div className="space-y-1">
              {project.entities.map((ent) => (
                <div key={ent.id} className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{ent.name}</span>
                  {ent.role && <span className="text-[10px] text-gray-400 capitalize">{ent.role}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment Needs */}
        {equipmentForDisplay.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Wrench className="h-3 w-3" /> Besoins machines ({equipmentForDisplay.length})
              </h4>
              {equipmentUpdatedAtLabel && (
                <span className="text-[10px] text-gray-400">
                  Mis à jour le {equipmentUpdatedAtLabel}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {equipmentForDisplay.map((eq) => (
                <EquipmentCard key={eq.id} eq={eq} />
              ))}
            </div>
          </div>
        )}

        {equipmentForDisplay.length === 0 && project.entities.length === 0 && project.documents.length === 0 && (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Pas encore de données détaillées pour ce projet</p>
          </div>
        )}
      </div>
    </div>
  );
}
