import supabase from './supabaseClient';

export interface MachineSearchHit {
  id: string;
  name: string;
  brand: string | null;
}

/** Évite les caractères spéciaux du LIKE / ilike côté valeur utilisateur. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .slice(0, 80)
    .replace(/[%_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeById(rows: MachineSearchHit[]): MachineSearchHit[] {
  const seen = new Set<string>();
  const out: MachineSearchHit[] = [];
  for (const r of rows) {
    if (!r?.id || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/**
 * Suggestions catalogue (nom puis marque), léger pour l'autocomplete header.
 */
export async function fetchMachineSearchSuggestions(term: string): Promise<MachineSearchHit[]> {
  const q = sanitizeSearchTerm(term);
  if (q.length < 2) return [];

  const pattern = `%${q}%`;

  const [nameRes, brandRes] = await Promise.all([
    supabase.from('machines').select('id,name,brand').ilike('name', pattern).limit(8),
    supabase.from('machines').select('id,name,brand').ilike('brand', pattern).limit(8),
  ]);

  if (nameRes.error) console.warn('[fetchMachineSearchSuggestions] name', nameRes.error);
  if (brandRes.error) console.warn('[fetchMachineSearchSuggestions] brand', brandRes.error);

  const merged = dedupeById([
    ...((nameRes.data || []) as MachineSearchHit[]),
    ...((brandRes.data || []) as MachineSearchHit[]),
  ]);
  return merged.slice(0, 8);
}
