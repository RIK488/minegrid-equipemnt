import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface MainDashboardLayoutProps {
  children: React.ReactNode;
  layout: any;
  onLayoutChange: (currentLayout: any, allLayouts: any) => void;
  dashboardConfig?: any;
}

export default function MainDashboardLayout({
  children,
  layout,
  onLayoutChange,
  dashboardConfig
}: MainDashboardLayoutProps) {
  if (!dashboardConfig || !dashboardConfig.widgets || !layout?.lg || layout.lg.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <div className="h-16 w-16 text-gray-300 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun widget configuré
          </h3>
          <p className="text-gray-600 mb-4">
            Configurez votre tableau de bord en allant dans le configurateur entreprise.
          </p>
          <button
            onClick={() => window.location.hash = '#entreprise'}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Configurer mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layout}
      breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
      cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
      rowHeight={100}
      onLayoutChange={onLayoutChange}
      draggableHandle=".handle"
    >
      {children}
    </ResponsiveGridLayout>
  );
} 