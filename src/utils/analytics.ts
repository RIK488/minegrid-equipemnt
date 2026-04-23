/**
 * Couche d'analytics minimale (P2 audit UX).
 * Branche Plausible (`window.plausible`) et/ou dataLayer sans imposer un fournisseur.
 */

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, props?: AnalyticsProps): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as Window & {
      plausible?: (name: string, opts?: { props?: Record<string, string | number | boolean> }) => void;
      dataLayer?: unknown[];
    };
    if (typeof w.plausible === 'function') {
      const clean: Record<string, string | number | boolean> = {};
      if (props) {
        for (const [k, v] of Object.entries(props)) {
          if (v !== undefined) clean[k] = v;
        }
      }
      w.plausible(
        eventName,
        Object.keys(clean).length
          ? { props: clean as Record<string, string | number | boolean> }
          : undefined,
      );
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: eventName, ...props });
    }
  } catch {
    /* no-op */
  }
}
