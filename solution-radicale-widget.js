console.log('🚀 SOLUTION RADICALE - Force l\'affichage du widget "Actions prioritaires du jour"');

// 1. Nettoyer complètement
console.log('🧹 Nettoyage complet...');
localStorage.clear();
sessionStorage.clear();

// 2. Configuration forcée
console.log('⚙️ Configuration forcée...');
const forcedConfig = {
  widgets: [
    {
      id: 'daily-priority-actions',
      type: 'daily-priority',
      title: 'Actions prioritaires du jour',
      description: 'Ce qu\'un vendeur doit faire chaque matin pour vendre plus',
      icon: 'Target',
      enabled: true,
      dataSource: 'daily-priority-actions',
      isCollapsed: false,
      position: 0
    }
  ],
  theme: 'light',
  layout: 'grid',
  refreshInterval: 30000,
  notifications: true
};

localStorage.setItem('dashboardConfig', JSON.stringify(forcedConfig));
localStorage.setItem('userRole', 'vendeur');
localStorage.setItem('widgetOrder', JSON.stringify(['daily-priority-actions']));

// 3. Créer le widget directement dans le DOM
console.log('🎯 Création directe du widget...');

// Données de test
const testData = [
  {
    id: 1,
    title: 'Relancer Ahmed Benali - Prospect chaud',
    description: 'A consulté votre CAT 320D 3 fois cette semaine. Prêt à acheter.',
    priority: 'high',
    category: 'prospection',
    impact: '+85%',
    impactDescription: 'Probabilité de conversion',
    estimatedTime: '15 min',
    status: 'pending',
    contact: {
      name: 'Ahmed Benali',
      phone: '+212 6 12 34 56 78',
      email: 'ahmed.benali@construction.ma',
      company: 'Construction Benali SARL'
    },
    action: 'Appel de suivi + envoi devis personnalisé',
    notes: 'Intéressé par financement leasing. Budget 450k MAD.',
    deadline: '2024-01-25'
  },
  {
    id: 2,
    title: 'Finaliser devis CAT 950GC - Mines du Sud',
    description: 'Devis en cours depuis 5 jours. Client impatient.',
    priority: 'high',
    category: 'devis',
    impact: '+70%',
    impactDescription: 'Chance de vente',
    estimatedTime: '30 min',
    status: 'pending',
    contact: {
      name: 'Fatima Zahra',
      phone: '+212 6 98 76 54 32',
      email: 'f.zahra@minesdusud.ma',
      company: 'Mines du Sud SA'
    },
    action: 'Finaliser devis + appel de présentation',
    notes: 'Demande spécifique: godet de 1.2m³, chenilles larges.',
    deadline: '2024-01-23'
  },
  {
    id: 3,
    title: 'Appel de relance - 12 prospects inactifs',
    description: 'Prospects qui n\'ont pas été contactés depuis 7+ jours.',
    priority: 'medium',
    category: 'relance',
    impact: '+25%',
    impactDescription: 'Taux de réactivation',
    estimatedTime: '45 min',
    status: 'pending',
    contact: {
      name: 'Liste de 12 prospects',
      phone: 'Voir détails',
      email: 'campagne@minegrid.ma',
      company: 'Diverses entreprises'
    },
    action: 'Campagne d\'appels + emails personnalisés',
    notes: 'Focus sur 3 prospects prioritaires restants.',
    deadline: '2024-01-26'
  }
];

// Fonction pour créer le widget HTML
function createWidgetHTML(data) {
  const stats = {
    total: data.length,
    high: data.filter(a => a.priority === 'high').length,
    medium: data.filter(a => a.priority === 'medium').length,
    low: data.filter(a => a.priority === 'low').length
  };

  return `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style="margin: 20px; max-width: 800px;">
      <!-- En-tête -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              🎯
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Actions prioritaires du jour</h3>
              <p style="margin: 0; font-size: 14px; color: #bfdbfe;">Ce qu'un vendeur doit faire chaque matin pour vendre plus</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold;">${stats.total}</div>
            <div style="font-size: 14px; color: #bfdbfe;">Actions en attente</div>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div style="background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <div style="display: flex; gap: 16px;">
            <span style="display: flex; align-items: center;">
              <span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #6b7280;">Haute: ${stats.high}</span>
            </span>
            <span style="display: flex; align-items: center;">
              <span style="width: 8px; height: 8px; background: #f97316; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #6b7280;">Moyenne: ${stats.medium}</span>
            </span>
            <span style="display: flex; align-items: center;">
              <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #6b7280;">Basse: ${stats.low}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="max-height: 400px; overflow-y: auto;">
        ${data.map(action => `
          <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: white;">
            <div style="display: flex; align-items: start; justify-content: space-between;">
              <div style="flex: 1;">
                <!-- En-tête action -->
                <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 8px;">
                  <div style="font-size: 18px;">${getCategoryIcon(action.category)}</div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <h4 style="margin: 0; font-size: 14px; font-weight: 500; color: #111827;">${action.title}</h4>
                      <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; border: 1px solid; ${getPriorityStyle(action.priority)}">
                        ${action.priority === 'high' ? 'Urgent' : action.priority === 'medium' ? 'Important' : 'Normal'}
                      </span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${action.description}</p>
                  </div>
                </div>

                <!-- Détails -->
                <div style="margin-left: 32px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <span style="display: flex; align-items: center; color: #059669; font-weight: 500;">
                        📈 ${action.impact} ${action.impactDescription}
                      </span>
                      <span style="display: flex; align-items: center; color: #2563eb; font-weight: 500;">
                        ⏰ ${action.estimatedTime}
                      </span>
                    </div>
                    <span style="color: #6b7280;">
                      Échéance: ${new Date(action.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <!-- Action à effectuer -->
                  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
                    <div style="font-size: 12px; font-weight: 500; color: #1e40af; margin-bottom: 4px;">🎯 Action à effectuer:</div>
                    <div style="font-size: 12px; color: #1e40af;">${action.action}</div>
                  </div>

                  <!-- Contact -->
                  ${action.contact ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #6b7280;">Contact:</span>
                        <span style="font-weight: 500;">${action.contact.name}</span>
                        <span style="color: #6b7280;">(${action.contact.company})</span>
                      </div>
                      <div style="display: flex; gap: 8px;">
                        ${action.contact.phone !== 'N/A' ? `
                          <button onclick="alert('Appel ${action.contact.phone}')" style="color: #2563eb; background: none; border: none; cursor: pointer; font-size: 12px;">
                            📞 ${action.contact.phone}
                          </button>
                        ` : ''}
                        ${action.contact.email !== 'N/A' ? `
                          <button onclick="alert('Email ${action.contact.email}')" style="color: #2563eb; background: none; border: none; cursor: pointer; font-size: 12px;">
                            ✉️ ${action.contact.email}
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Notes -->
                  ${action.notes ? `
                    <div style="font-size: 12px; color: #6b7280; background: #f9fafb; padding: 8px; border-radius: 4px;">
                      <span style="font-weight: 500;">💡 Note:</span> ${action.notes}
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Boutons -->
              <div style="margin-left: 16px; display: flex; flex-direction: column; gap: 4px;">
                <button onclick="alert('Action terminée: ${action.title}')" style="font-size: 12px; background: #059669; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; hover: background: #047857;">
                  Terminer
                </button>
                ${action.contact && action.contact.email !== 'N/A' ? `
                  <button onclick="alert('Email de recommandation envoyé à ${action.contact.name}')" style="font-size: 12px; background: #2563eb; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">
                    📧 Email
                  </button>
                ` : ''}
                ${(action.category === 'marketing' || action.category === 'prospection') ? `
                  <button onclick="alert('Mise en avant Premium pour ${action.title}')" style="font-size: 12px; background: #7c3aed; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">
                    ⭐ Premium
                  </button>
                ` : ''}
                ${(action.category === 'pricing' || action.title.toLowerCase().includes('prix')) ? `
                  <button onclick="alert('Réduction de prix pour ${action.title}')" style="font-size: 12px; background: #dc2626; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">
                    💰 Prix
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Actions rapides -->
      <div style="background: linear-gradient(to right, #fef3c7, #fecaca); padding: 12px 16px; border-top: 1px solid #fbbf24;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">⚡ Actions rapides prioritaires</h4>
          <span style="font-size: 12px; background: #fbbf24; color: #92400e; padding: 2px 8px; border-radius: 12px;">
            Actions globales
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <button onclick="alert('Envoi de ${data.length} emails de recommandation automatiques')" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #2563eb; color: white; font-size: 12px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">
            📧 Recommander via Email
          </button>
          <button onclick="alert('Mise en avant Premium pour ${data.filter(a => a.category === 'marketing' || a.category === 'prospection').length} actions')" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #7c3aed; color: white; font-size: 12px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">
            ⭐ Mettre en avant (Premium)
          </button>
          <button onclick="alert('Réduction de prix pour ${data.filter(a => a.category === 'pricing' || a.title.toLowerCase().includes('prix')).length} articles')" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #dc2626; color: white; font-size: 12px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">
            📉 Baisser le prix
          </button>
        </div>
      </div>
    </div>
  `;
}

// Fonctions utilitaires
function getCategoryIcon(category) {
  const icons = {
    'prospection': '👤',
    'devis': '📋',
    'relance': '📞',
    'pricing': '💰',
    'marketing': '📢',
    'finance': '💳',
    'appel_offres': '🏗️'
  };
  return icons[category] || '📋';
}

function getPriorityStyle(priority) {
  const styles = {
    'high': 'background: #fef2f2; color: #dc2626; border-color: #fecaca;',
    'medium': 'background: #fffbeb; color: #d97706; border-color: #fed7aa;',
    'low': 'background: #f0fdf4; color: #16a34a; border-color: #bbf7d0;'
  };
  return styles[priority] || 'background: #f3f4f6; color: #6b7280; border-color: #d1d5db;';
}

// 4. Créer et insérer le widget
console.log('🎨 Création du widget HTML...');

// Chercher un conteneur approprié
let container = document.querySelector('.dashboard') || 
                document.querySelector('[class*="dashboard"]') ||
                document.querySelector('main') ||
                document.querySelector('#root') ||
                document.body;

// Créer un conteneur dédié
const widgetContainer = document.createElement('div');
widgetContainer.id = 'forced-widget-container';
widgetContainer.style.cssText = `
  position: relative;
  z-index: 1000;
  margin: 20px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

widgetContainer.innerHTML = `
  <div style="background: #3b82f6; color: white; padding: 12px; margin: -20px -20px 20px -20px; border-radius: 10px 10px 0 0; display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">🚀</span>
      <strong>Widget "Actions prioritaires du jour" - FORCÉ</strong>
    </div>
    <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
      Fermer
    </button>
  </div>
  ${createWidgetHTML(testData)}
`;

// Insérer au début du conteneur
if (container) {
  container.insertBefore(widgetContainer, container.firstChild);
  console.log('✅ Widget inséré avec succès !');
} else {
  document.body.appendChild(widgetContainer);
  console.log('✅ Widget inséré dans le body');
}

// 5. Vérification finale
console.log('\n✅ SOLUTION RADICALE APPLIQUÉE');
console.log('📊 Widget créé avec', testData.length, 'actions');
console.log('🎯 Actions rapides disponibles');
console.log('📞 Contacts cliquables');
console.log('📈 Métriques d\'impact');

// 6. Recharger la page après 5 secondes pour appliquer la configuration
setTimeout(() => {
  console.log('🔄 Rechargement de la page dans 5 secondes pour appliquer la configuration...');
  setTimeout(() => {
    window.location.reload();
  }, 5000);
}, 1000);

console.log('\n🎉 Le widget "Actions prioritaires du jour" est maintenant affiché !'); 