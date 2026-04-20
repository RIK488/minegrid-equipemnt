import { getCurrentUser } from './auth';

// -------------------- SESSIONS ACTIVES --------------------

export async function getActiveSessions() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // En production, vous auriez une table sessions
  // Pour l'instant, on simule avec des données
  return [
    {
      id: 'current',
      device: 'Chrome sur Windows',
      location: 'Paris, France',
      last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      is_current: true
    },
    {
      id: 'mobile',
      device: 'Safari sur iPhone',
      location: 'Lyon, France',
      last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1j ago
      is_current: false
    }
  ];
}

export async function revokeSession(sessionId: string) {
  // En production, vous supprimeriez la session de la base de données
  return { success: true };
}
