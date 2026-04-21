import { notificationService } from '../services/notificationService';

/**
 * Helper drop-in pour remplacer les `alert(msg)` du code legacy.
 *
 * Heuristique d'inference du type : si le message contient un mot-cle
 * d'erreur (erreur, error, echec, echoue, impossible, invalid...) on
 * emet une notification `error`, sinon un `success`. Les appels qui
 * veulent un controle fin doivent utiliser directement
 * `notificationService.{success,error,warning,info}`.
 *
 * L'API expose a la fois :
 *   - `toast(msg)`               : usage rapide
 *   - `toast(msg, 'success')`    : forcer un type
 *   - `toast.success(msg)` etc.  : style "sonner/react-hot-toast"
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const ERROR_HINTS = [
  'erreur',
  'error',
  'echec',
  'echoue',
  'impossible',
  'invalid',
  'incorrect',
  'introuvable',
  'non autorise',
  'refuse',
  'required',
  'obligatoire',
];

function inferType(message: string): ToastType {
  const lower = message.toLowerCase();
  return ERROR_HINTS.some((h) => lower.includes(h)) ? 'error' : 'success';
}

type ToastFn = {
  (message: string, type?: ToastType): void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const toastImpl = (message: string, type?: ToastType) => {
  const resolved = type ?? inferType(message);
  const defaultTitle: Record<ToastType, string> = {
    success: 'Succes',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
  };
  notificationService[resolved](defaultTitle[resolved], message);
};

export const toast: ToastFn = Object.assign(toastImpl, {
  success: (m: string, t = 'Succes') => notificationService.success(t, m),
  error: (m: string, t = 'Erreur') => notificationService.error(t, m),
  warning: (m: string, t = 'Attention') => notificationService.warning(t, m),
  info: (m: string, t = 'Information') => notificationService.info(t, m),
});

export default toast;
