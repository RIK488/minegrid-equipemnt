import React from 'react';
import { EnterpriseDashboardShell } from './enterprise-shell';
import { MecanicienWidgets } from './widgets/MecanicienWidgets';

const WIDGETS_MECANICIEN_IDS = [
  'interventions-today',
  'repair-status',
  'parts-inventory',
  'technician-workload',
];

const EnterpriseDashboardMecanicienDisplay: React.FC = () => (
  <EnterpriseDashboardShell
    role="mecanicien"
    widgetsSource={MecanicienWidgets}
    validIds={WIDGETS_MECANICIEN_IDS}
    modalLabel="widget mécanicien"
  />
);

export default EnterpriseDashboardMecanicienDisplay;
