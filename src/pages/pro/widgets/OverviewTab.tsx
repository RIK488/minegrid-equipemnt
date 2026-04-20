import {
  AlertTriangle,
  Bell,
  CheckCircle,
  FileText,
  Package,
  Wrench,
  XCircle,
} from 'lucide-react';
import React from 'react';
import type { PortalStats } from '../types';

export function OverviewTab({ stats }: { stats: PortalStats | null }) {
  if (!stats) return <div>Chargement des statistiques...</div>;

  const statCards = [
    {
      title: 'Équipements Totaux',
      value: stats.totalEquipment,
      icon: Package,
      color: 'bg-orange-500',
      change: '+2 ce mois'
    },
    {
      title: 'Équipements Actifs',
      value: stats.activeEquipment,
      icon: CheckCircle,
      color: 'bg-orange-600',
      change: `${((stats.activeEquipment / stats.totalEquipment) * 100).toFixed(1)}%`
    },
    {
      title: 'Commandes en Attente',
      value: stats.pendingOrders,
      icon: FileText,
      color: 'bg-orange-400',
      change: 'À traiter'
    },
    {
      title: 'Interventions à Venir',
      value: stats.upcomingInterventions,
      icon: Wrench,
      color: 'bg-orange-700',
      change: 'Cette semaine'
    },
    {
      title: 'Notifications Non Lues',
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'bg-orange-800',
      change: 'Nouvelles'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Vue d'ensemble</h2>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Graphiques et tableaux de bord */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance préventive</span>
              <span className="text-sm text-orange-600">Terminée</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nouvelle commande</span>
              <span className="text-sm text-orange-500">En attente</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Diagnostic équipement</span>
              <span className="text-sm text-orange-700">En cours</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-600">Maintenance due dans 3 jours</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-orange-700 mr-2" />
              <span className="text-sm text-gray-600">Garantie expirée - Équipement #123</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-sm text-gray-600">Diagnostic OK - Équipement #456</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
