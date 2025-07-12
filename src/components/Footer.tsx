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
            <div className="flex space-x-4">
              <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                Twitter
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#machines" className="hover:text-orange-400 transition-colors">Machines</a></li>
              <li><a href="#services" className="hover:text-orange-400 transition-colors">Services</a></li>
              <li><a href="#contact" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#blog" className="hover:text-orange-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@minegrid.com</li>
              <li>Tél: +225 27 22 49 89 00</li>
              <li>Adresse: Abidjan, Côte d'Ivoire</li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 ${
          theme === 'light' ? 'border-gray-700' : 'border-gray-600'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-80">
              © 2024 Minegrid Équipement. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:text-orange-400 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 