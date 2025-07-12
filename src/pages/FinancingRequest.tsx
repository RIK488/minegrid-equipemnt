import React, { useState } from 'react';
import FinancingSimulator from '../components/FinancingSimulator';
import { Info, Upload, FileText, User, Banknote, FileCheck2, FileSignature, FileSpreadsheet, FileInput, ShieldCheck, ClipboardEdit, X } from 'lucide-react';

// Simuler récupération de l'utilisateur connecté
const mockUser = {
  company: 'Ma Société SARL',
  email: 'contact@masociete.com',
  manager: 'Jean Dupont',
};

const requiredDocs = [
  { key: 'kbis', label: "Extrait Kbis ou registre de commerce", icon: <FileText className="h-5 w-5 text-primary-600" /> },
  { key: 'statuts', label: "Statuts de la société", icon: <FileSignature className="h-5 w-5 text-primary-600" /> },
  { key: 'cni', label: "Carte d'identité du gérant", icon: <User className="h-5 w-5 text-primary-600" /> },
  { key: 'rib', label: "RIB professionnel", icon: <Banknote className="h-5 w-5 text-primary-600" /> },
  { key: 'bilan', label: "Dernier bilan ou synthèse activité", icon: <FileSpreadsheet className="h-5 w-5 text-primary-600" /> },
  { key: 'devis', label: "Devis ou facture pro forma de l'engin", icon: <FileCheck2 className="h-5 w-5 text-primary-600" /> },
  { key: 'fiche', label: "Fiche technique du matériel", icon: <FileInput className="h-5 w-5 text-primary-600" /> },
];

export default function FinancingRequest() {
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: File | null }>({});
  const [apport, setApport] = useState('');
  const [note, setNote] = useState('');
  const [machinePrice, setMachinePrice] = useState(50000);
  const [success, setSuccess] = useState(false);

  // Simuler sécurité utilisateur connecté
  const user = mockUser; // Remplacer par useAuth() ou contexte réel
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const handleFileChange = (key: string, file: File | null) => {
    setUploadedDocs((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemoveFile = (key: string) => {
    setUploadedDocs((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer les données et fichiers à l'API/n8n
    setSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Demander un financement</h1>
      {/* Simulateur */}
      <div className="mb-10">
        <FinancingSimulator machinePrice={machinePrice} />
      </div>
      {/* Formulaire d'accord de principe */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
          Accord de principe — Dossier simplifié
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
            <input type="text" value={user.company} disabled className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user.email} disabled className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gérant</label>
            <input type="text" value={user.manager} disabled className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apport disponible (€)</label>
            <input type="number" value={apport} onChange={e => setApport(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Note explicative (utilité, chantiers visés...)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Ex : Achat pour chantier X, client Y..." />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <ClipboardEdit className="h-5 w-5 text-primary-600 mr-2" />
            Documents à fournir
          </h3>
          <ul className="space-y-3">
            {requiredDocs.map(doc => (
              <li key={doc.key} className="flex items-center gap-3 bg-primary-50 rounded-lg px-3 py-2">
                {doc.icon}
                <span className="flex-1 text-gray-700">{doc.label}</span>
                {uploadedDocs[doc.key] ? (
                  <span className="flex items-center gap-2">
                    <span className="text-green-700 text-xs font-medium">{uploadedDocs[doc.key]?.name}</span>
                    <button type="button" onClick={() => handleRemoveFile(doc.key)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                  </span>
                ) : (
                  <label className="inline-block cursor-pointer bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-md border border-primary-200 text-xs font-medium transition-colors">
                    <Upload className="h-4 w-4 inline mr-1" />
                    Télécharger
                    <input type="file" className="hidden" onChange={e => handleFileChange(doc.key, e.target.files?.[0] || null)} />
                  </label>
                )}
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-primary-700 shadow-md transition-colors">
          Envoyer la demande
        </button>
        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
            Votre demande a bien été envoyée. Un conseiller vous contactera sous 24h.
          </div>
        )}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start">
          <Info className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Dossier simplifié</p>
            <p className="text-xs mt-1">
              Fournissez au moins les documents principaux pour accélérer l'accord de principe. Les pièces complémentaires pourront être demandées plus tard.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
} 