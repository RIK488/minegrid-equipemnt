

export const getEquipmentAvailabilityData = (widgetId: string) => {
  console.log('[DEBUG] getEquipmentAvailabilityData appelée avec widgetId:', widgetId);

  // Retourner des données de test pour le moment
  // Plus tard, cela appellera l'API réelle de manière asynchrone
  return [
    {
      id: '1',
      equipmentFullName: 'Pelle hydraulique CAT 320',
      status: 'Disponible',
      statusColor: 'green',
      usageRate: 25,
      year: 2020,
      condition: 'Excellent',
      brand: 'CAT',
      model: '320'
    },
    {
      id: '2',
      equipmentFullName: 'Chargeur frontal JCB',
      status: 'En location',
      statusColor: 'orange',
      usageRate: 85,
      year: 2019,
      condition: 'Bon',
      brand: 'JCB',
      model: '3CX',
      currentRental: {
        startDate: '2024-01-15',
        endDate: '2024-01-25',
        status: 'En cours'
      }
    },
    {
      id: '3',
      equipmentFullName: 'Bulldozer D6',
      status: 'Maintenance',
      statusColor: 'red',
      usageRate: 0,
      year: 2018,
      condition: 'Maintenance',
      brand: 'CAT',
      model: 'D6',
      currentIntervention: {
        scheduledDate: '2024-01-20',
        status: 'En cours'
      }
    }
  ];
};
