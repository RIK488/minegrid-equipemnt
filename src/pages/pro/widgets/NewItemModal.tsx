import React, { useState } from 'react';
import {
  addClientEquipment,
  createClientOrder,
  createMaintenanceIntervention,
  inviteClientUser,
} from '../../../utils/proApi';
import { XCircle } from 'lucide-react';
import type { NewItemModalProps } from '../types';

export function NewItemModal({ type, onClose, onSuccess }: NewItemModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      switch (type) {
        case 'equipment':
          await addClientEquipment(formData);
          break;
        case 'order':
          await createClientOrder(formData);
          break;
        case 'maintenance':
          await createMaintenanceIntervention(formData);
          break;
        case 'user':
          await inviteClientUser(formData.email, formData.role);
          break;
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getModalTitle = () => {
    switch (type) {
      case 'equipment': return 'Nouvel équipement';
      case 'order': return 'Nouvelle commande';
      case 'maintenance': return 'Intervention maintenance';
      case 'user': return 'Inviter utilisateur';
      case 'document': return 'Nouveau document';
      default: return 'Nouvel élément';
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'equipment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de série *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'équipement *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('equipment_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="excavatrice">Excavatrice</option>
                <option value="pelle">Pelle hydraulique</option>
                <option value="chargeur">Chargeur</option>
                <option value="bulldozer">Bulldozer</option>
                <option value="camion">Camion</option>
                <option value="concasseur">Concasseur</option>
              </select>
            </div>
          </div>
        );

      case 'order':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de commande *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('order_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="purchase">Achat</option>
                <option value="rental">Location</option>
                <option value="maintenance">Maintenance</option>
                <option value="import">Import</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'intervention *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('intervention_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="preventive">Maintenance préventive</option>
                <option value="corrective">Maintenance corrective</option>
                <option value="emergency">Intervention d'urgence</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date prévue *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        );

      case 'user':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="">Sélectionner un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="manager">Manager</option>
                <option value="technician">Technicien</option>
                <option value="viewer">Lecteur</option>
              </select>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du document *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de document *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('document_type', e.target.value)}
              >
                <option value="">Sélectionner un type</option>
                <option value="manual">Manuel</option>
                <option value="specification">Spécification</option>
                <option value="contract">Contrat</option>
                <option value="invoice">Facture</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier *
              </label>
              <input
                type="file"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => handleInputChange('file', e.target.files?.[0])}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Document public
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {renderForm()}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
