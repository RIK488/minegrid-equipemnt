/**
 * Compatibilite ascendante : l'implementation a migre dans
 * `src/contexts/AuthContext.tsx` pour partager un seul listener
 * `onAuthStateChange` entre tous les consommateurs. Les sites d'appel
 * existants continuent de fonctionner sans modification.
 */
export { useAuth } from '../contexts/AuthContext';
