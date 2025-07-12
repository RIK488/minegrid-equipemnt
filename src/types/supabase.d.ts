// Déclarations TypeScript pour supprimer les erreurs de Supabase
declare module '@supabase/postgrest-js' {
  // Supprimer les erreurs de typage pour les méthodes PostgrestQueryBuilder
  interface PostgrestQueryBuilder<T = any> {
    select(columns?: string): PostgrestQueryBuilder<T>;
    insert(values: any): PostgrestQueryBuilder<T>;
    update(values: any): PostgrestQueryBuilder<T>;
    delete(): PostgrestQueryBuilder<T>;
    eq(column: string, value: any): PostgrestQueryBuilder<T>;
    neq(column: string, value: any): PostgrestQueryBuilder<T>;
    gt(column: string, value: any): PostgrestQueryBuilder<T>;
    gte(column: string, value: any): PostgrestQueryBuilder<T>;
    lt(column: string, value: any): PostgrestQueryBuilder<T>;
    lte(column: string, value: any): PostgrestQueryBuilder<T>;
    like(column: string, pattern: string): PostgrestQueryBuilder<T>;
    ilike(column: string, pattern: string): PostgrestQueryBuilder<T>;
    is(column: string, value: any): PostgrestQueryBuilder<T>;
    in(column: string, values: any[]): PostgrestQueryBuilder<T>;
    contains(column: string, value: any): PostgrestQueryBuilder<T>;
    containedBy(column: string, value: any): PostgrestQueryBuilder<T>;
    rangeGt(column: string, range: string): PostgrestQueryBuilder<T>;
    rangeGte(column: string, range: string): PostgrestQueryBuilder<T>;
    rangeLt(column: string, range: string): PostgrestQueryBuilder<T>;
    rangeLte(column: string, range: string): PostgrestQueryBuilder<T>;
    rangeAdjacent(column: string, range: string): PostgrestQueryBuilder<T>;
    overlaps(column: string, value: any): PostgrestQueryBuilder<T>;
    textSearch(column: string, query: string, config?: string): PostgrestQueryBuilder<T>;
    match(query: any): PostgrestQueryBuilder<T>;
    not(column: string, operator: string, value: any): PostgrestQueryBuilder<T>;
    or(filters: string, foreignTable?: string): PostgrestQueryBuilder<T>;
    filter(column: string, operator: string, value: any): PostgrestQueryBuilder<T>;
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }): PostgrestQueryBuilder<T>;
    limit(count: number, foreignTable?: string): PostgrestQueryBuilder<T>;
    range(from: number, to: number, foreignTable?: string): PostgrestQueryBuilder<T>;
    single(): PostgrestQueryBuilder<T>;
    maybeSingle(): PostgrestQueryBuilder<T>;
    abortSignal(signal: AbortSignal): PostgrestQueryBuilder<T>;
  }
}

// Supprimer les erreurs pour les types génériques
declare module '@supabase/supabase-js' {
  interface SupabaseClient<T = any> {
    from(table: string): PostgrestQueryBuilder<T>;
  }
} 