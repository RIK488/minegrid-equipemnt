import React from 'react';
import SalesEvolutionWidgetEnriched from './components/SalesEvolutionWidgetEnriched';

const WidgetTest = () => {
  console.log('🧪 Test du widget enrichi');
  
  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test du Widget Enrichi</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <SalesEvolutionWidgetEnriched />
      </div>
    </div>
  );
};

export default WidgetTest; 