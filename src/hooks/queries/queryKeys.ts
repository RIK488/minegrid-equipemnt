/**
 * Cle de cache centralisee pour React Query.
 *
 * Regle : toutes les cles sont des tuples typees. Le tuple commence par le
 * domaine metier, puis des discriminants optionnels (userId, status, etc).
 * Ca permet des invalidations en cascade (queryClient.invalidateQueries({ queryKey: ['messages'] })).
 */

export const queryKeys = {
  messages: {
    all: ['messages'] as const,
    list: () => ['messages', 'list'] as const,
  },
  offers: {
    all: ['offers'] as const,
    list: () => ['offers', 'list'] as const,
  },
  userProfile: {
    all: ['userProfile'] as const,
    me: () => ['userProfile', 'me'] as const,
  },
  userMachines: {
    all: ['userMachines'] as const,
    list: () => ['userMachines', 'list'] as const,
  },
  clientNotifications: {
    all: ['clientNotifications'] as const,
    list: () => ['clientNotifications', 'list'] as const,
  },
  categoryCounts: {
    all: ['categoryCounts'] as const,
  },
  publicMachineCount: {
    all: ['publicMachineCount'] as const,
  },
  machineSearchSuggest: {
    all: ['machineSearchSuggest'] as const,
    byTerm: (term: string) => ['machineSearchSuggest', term] as const,
  },
} as const;
