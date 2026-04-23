import React from 'react';
import { useThemeStore } from '../stores/themeStore';

export default function Footer() {
  const { theme } = useThemeStore();

  return (
    <footer className={`mt-auto py-8 ${
      theme === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-300'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="/logo Minegrid equipement trans.png" 
              alt="Minegrid Équipement" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-sm opacity-80 mb-4">
              Votre plateforme de confiance pour l'achat et la vente d'équipements industriels 
              et de machines de construction en Afrique.
            </p>
            <p className="text-xs opacity-70 mb-2">Réseaux sociaux</p>
            <p className="text-sm opacity-90">
              Présence sur les réseaux en cours de déploiement. Pour toute demande média :{' '}
              <a
                href="mailto:contact@minegrid.com?subject=Reseaux%20sociaux"
                className="text-orange-400 hover:text-orange-300 underline"
              >
                contact@minegrid.com
              </a>
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#machines" className="hover:text-orange-400 transition-colors">Machines</a></li>
              <li><a href="#services" className="hover:text-orange-400 transition-colors">Services</a></li>
              <li><a href="#contact" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#blog" className="hover:text-orange-400 transition-colors">Blog</a></li>
              <li><a href="#inscription?type=seller" className="hover:text-orange-400 transition-colors">Devenir vendeur</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@minegrid.com" className="hover:text-orange-400 transition-colors">
                  contact@minegrid.com
                </a>
              </li>
              <li>Abidjan, Côte d&apos;Ivoire</li>
              <li className="text-xs opacity-70 pt-2">
                Standard téléphonique : à compléter lorsque les lignes seront ouvertes au public.
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 ${
          theme === 'light' ? 'border-gray-700' : 'border-gray-600'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-80 text-center md:text-left">
              © {new Date().getFullYear()} Minegrid Équipement. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <a href="#mentions-legales" className="hover:text-orange-400 transition-colors">Mentions légales</a>
              <a href="#politique-confidentialite" className="hover:text-orange-400 transition-colors">Politique de confidentialité</a>
              <a href="#conditions-utilisation" className="hover:text-orange-400 transition-colors">Conditions d&apos;utilisation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
