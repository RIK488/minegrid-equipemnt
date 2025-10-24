// Configuration des URLs pour la réinitialisation de mot de passe
export const getResetPasswordUrl = () => {
  // Utiliser la variable d'environnement si définie, sinon l'URL de production
  const productionUrl = import.meta.env.VITE_PRODUCTION_URL || 'https://minegrid-equipement.com';
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // En développement, toujours rediriger vers la production
    return `${productionUrl}/#update-password`;
  }
  
  const baseUrl = window.location.origin;
  return `${baseUrl}/#update-password`;
};

export const getLoginUrl = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#connexion`;
};

export const getHomeUrl = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#`;
};
