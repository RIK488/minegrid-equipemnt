import React from 'react';
import { Globe, FileText, DollarSign, Package, Mail, Calendar, Zap, BarChart3 } from 'lucide-react';

interface SidebarMenuProps {
  dashboardConfig?: any;
  layout?: any;
}

export default function SidebarMenu({ dashboardConfig, layout }: SidebarMenuProps) {
  // Afficher seulement quand le dashboard est configuré
  if (!dashboardConfig || !dashboardConfig.widgets || !layout?.lg || layout.lg.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services en commun</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <a
            href="#vitrine"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Globe className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Vitrine</span>
          </a>
          <a
            href="#publication"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <FileText className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Publication</span>
          </a>
          <a
            href="#devis"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <DollarSign className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Devis</span>
          </a>
          <a
            href="#documents"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Package className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Documents</span>
          </a>
          <a
            href="#messages"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Mail className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Messages</span>
          </a>
          <a
            href="#planning"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Calendar className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Planning</span>
          </a>
          <a
            href="#assistant-ia"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Zap className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Assistant IA</span>
          </a>
          <a
            href="#dashboard-entreprise"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <BarChart3 className="h-6 w-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-orange-700">Tableau de bord</span>
          </a>
        </div>
      </div>
    </div>
  );
} 