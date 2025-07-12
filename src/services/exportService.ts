// Types pour les exports
export interface ExportOptions {
  format: 'pdf' | 'excel';
  filename?: string;
  includeCharts?: boolean;
  includeData?: boolean;
}

export interface ExportData {
  title: string;
  data: any[];
  columns?: string[];
  summary?: {
    total?: number;
    average?: number;
    count?: number;
  };
}

// Service d'export unifié
class ExportService {
  // Exporter les actions commerciales
  async exportActions(actions: any[], options: ExportOptions = { format: 'pdf' }) {
    const exportData: ExportData = {
      title: 'Actions Commerciales Prioritaires',
      data: actions.map(action => ({
        'Titre': action.title,
        'Description': action.description,
        'Priorité': action.priority,
        'Catégorie': action.category,
        'Heure': action.dueTime,
        'Statut': action.status,
        'Contact': action.contact?.name || '',
        'Valeur': action.value ? `${action.value.toLocaleString()} MAD` : '',
        'Durée estimée': `${action.estimatedDuration} min`
      })),
      summary: {
        total: actions.length,
        count: actions.filter(a => a.status === 'completed').length
      }
    };

    return this.generateExport(exportData, options);
  }

  // Exporter le pipeline commercial
  async exportPipeline(leads: any[], options: ExportOptions = { format: 'pdf' }) {
    const exportData: ExportData = {
      title: 'Pipeline Commercial',
      data: leads.map(lead => ({
        'Prospect': lead.title,
        'Étape': lead.stage,
        'Priorité': lead.priority,
        'Valeur': `${lead.value.toLocaleString()} MAD`,
        'Probabilité': `${lead.probability}%`,
        'Prochaine action': lead.nextAction,
        'Assigné à': lead.assignedTo,
        'Dernier contact': new Date(lead.lastContact).toLocaleDateString('fr-FR'),
        'Notes': lead.notes
      })),
      summary: {
        total: leads.reduce((sum, lead) => sum + lead.value, 0),
        count: leads.length
      }
    };

    return this.generateExport(exportData, options);
  }

  // Exporter les équipements
  async exportEquipments(equipments: any[], options: ExportOptions = { format: 'pdf' }) {
    const exportData: ExportData = {
      title: 'Plan d\'action Stock & Revente',
      data: equipments.map(eq => ({
        'Équipement': eq.name,
        'Catégorie': eq.category,
        'Prix': `${eq.price.toLocaleString()} MAD`,
        'Jours en stock': eq.daysInStock,
        'Statut': eq.status,
        'Boosté': eq.boosted ? 'Oui' : 'Non',
        'Description': eq.description
      })),
      summary: {
        total: equipments.reduce((sum, eq) => sum + eq.price, 0),
        count: equipments.length
      }
    };

    return this.generateExport(exportData, options);
  }

  // Exporter les performances de vente
  async exportSalesPerformance(data: any, options: ExportOptions = { format: 'pdf' }) {
    const exportData: ExportData = {
      title: 'Score de Performance Commerciale',
      data: [
        {
          'Métrique': 'Score global',
          'Valeur': `${data.score}/100`,
          'Objectif': `${data.target}/100`
        },
        {
          'Métrique': 'Ventes',
          'Valeur': `${data.sales.toLocaleString()} MAD`,
          'Objectif': `${data.salesTarget.toLocaleString()} MAD`
        },
        {
          'Métrique': 'Croissance',
          'Valeur': `${data.growth}%`,
          'Objectif': `${data.growthTarget}%`
        },
        {
          'Métrique': 'Prospects',
          'Valeur': data.prospects.toString(),
          'Objectif': 'N/A'
        },
        {
          'Métrique': 'Temps de réponse',
          'Valeur': `${data.responseTime}h`,
          'Objectif': `${data.responseTarget}h`
        }
      ],
      summary: {
        count: 5
      }
    };

    return this.generateExport(exportData, options);
  }

  // Exporter l'évolution des ventes
  async exportSalesEvolution(data: any, options: ExportOptions = { format: 'pdf' }) {
    const exportData: ExportData = {
      title: 'Évolution des Ventes',
      data: data.monthlyData?.map((month: any) => ({
        'Mois': month.month,
        'Ventes': `${month.sales.toLocaleString()} MAD`,
        'Objectif': `${month.target.toLocaleString()} MAD`,
        'Écart': `${month.gap.toLocaleString()} MAD`,
        'Taux de réalisation': `${month.achievementRate}%`
      })) || [],
      summary: {
        total: data.monthlyData?.reduce((sum: number, month: any) => sum + month.sales, 0) || 0,
        count: data.monthlyData?.length || 0
      }
    };

    return this.generateExport(exportData, options);
  }

  // Générer l'export (PDF ou Excel)
  private async generateExport(exportData: ExportData, options: ExportOptions) {
    const filename = options.filename || `${exportData.title}_${new Date().toISOString().split('T')[0]}`;

    if (options.format === 'pdf') {
      return this.generatePDF(exportData, filename);
    } else {
      return this.generateExcel(exportData, filename);
    }
  }

  // Générer un PDF
  private async generatePDF(data: ExportData, filename: string) {
    try {
      // Simulation d'export PDF (à remplacer par une vraie librairie comme jsPDF)
      const pdfContent = `
        <html>
          <head>
            <title>${data.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #f97316; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f97316; color: white; }
              .summary { margin-top: 20px; padding: 10px; background-color: #fef3c7; }
            </style>
          </head>
          <body>
            <h1>${data.title}</h1>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            
            <table>
              <thead>
                <tr>
                  ${Object.keys(data.data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.data.map(row => 
                  `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
            
            ${data.summary ? `
              <div class="summary">
                <h3>Résumé</h3>
                ${data.summary.total ? `<p>Total: ${data.summary.total.toLocaleString()} MAD</p>` : ''}
                ${data.summary.count ? `<p>Nombre d'éléments: ${data.summary.count}</p>` : ''}
                ${data.summary.average ? `<p>Moyenne: ${data.summary.average.toLocaleString()} MAD</p>` : ''}
              </div>
            ` : ''}
          </body>
        </html>
      `;

      // Créer un blob et télécharger
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename: `${filename}.html` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la génération du PDF' };
    }
  }

  // Générer un Excel
  private async generateExcel(data: ExportData, filename: string) {
    try {
      // Simulation d'export Excel (à remplacer par une vraie librairie comme xlsx)
      const csvContent = [
        // En-têtes
        Object.keys(data.data[0] || {}).join(','),
        // Données
        ...data.data.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      // Créer un blob et télécharger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename: `${filename}.csv` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la génération de l\'Excel' };
    }
  }
}

export const exportService = new ExportService(); 