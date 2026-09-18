import React, { useState } from 'react';
import { Movement, ElectricityEntry, ElectricityType } from '../types';
import { formatCurrency, formatDate, calculateElectricityDurationAndAmount } from '../utils/calculations';
import { generateVoucherNumber } from '../utils/storage';
import { Zap, Plus, Edit2, Trash2, Printer, Search, Check, X, AlertCircle } from 'lucide-react';

interface ElectricityRegistryProps {
  movements: Movement[];
  selectedMovementId: string | null;
  onSelectMovement: (movementId: string) => void;
  onUpdateMovementElectricity: (movementId: string, updatedEntries: ElectricityEntry[]) => void;
  onPrintElectricitySheet: (movement: Movement) => void;
}

export const ElectricityRegistry: React.FC<ElectricityRegistryProps> = ({
  movements,
  selectedMovementId,
  onSelectMovement,
  onUpdateMovementElectricity,
  onPrintElectricitySheet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState<ElectricityType>('Horaire');
  const [plugTime, setPlugTime] = useState('08:00');
  const [unplugTime, setUnplugTime] = useState('12:00');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [formError, setFormError] = useState('');

  // Selected movement
  const selectedMovement = movements.find((m) => m.id === selectedMovementId) || movements[0] || null;

  // Filtered movements for dropdown
  const filteredMovements = movements.filter((m) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      m.clientCode.toLowerCase().includes(term) ||
      m.ownerName.toLowerCase().includes(term) ||
      m.boatName.toLowerCase().includes(term) ||
      m.registrationNumber.toLowerCase().includes(term)
    );
  });

  const openNewForm = () => {
    setEditingEntryId(null);
    setDate(todayStr);
    setType('Horaire');
    setPlugTime('08:00');
    setUnplugTime('12:00');
    setVoucherNumber(generateVoucherNumber());
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (entry: ElectricityEntry) => {
    setEditingEntryId(entry.id);
    setDate(entry.date);
    setType(entry.type);
    setPlugTime(entry.plugTime || '08:00');
    setUnplugTime(entry.unplugTime || '12:00');
    setVoucherNumber(entry.voucherNumber);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovement) return;

    if (!date) {
      setFormError('Veuillez saisir une date valide.');
      return;
    }

    const { durationHours, amount } = calculateElectricityDurationAndAmount(type, plugTime, unplugTime);

    let updatedEntries: ElectricityEntry[];

    if (editingEntryId) {
      // Edit existing
      updatedEntries = selectedMovement.electricityEntries.map((item) => {
        if (item.id === editingEntryId) {
          return {
            ...item,
            voucherNumber: voucherNumber || item.voucherNumber,
            date,
            type,
            plugTime: type === 'Horaire' ? plugTime : undefined,
            unplugTime: type === 'Horaire' ? unplugTime : undefined,
            durationHours,
            amount,
          };
        }
        return item;
      });
    } else {
      // Create new
      const newEntry: ElectricityEntry = {
        id: `ELEC-${Date.now()}`,
        voucherNumber: voucherNumber || generateVoucherNumber(),
        movementId: selectedMovement.id,
        clientCode: selectedMovement.clientCode,
        boatRegistration: selectedMovement.registrationNumber,
        date,
        type,
        plugTime: type === 'Horaire' ? plugTime : undefined,
        unplugTime: type === 'Horaire' ? unplugTime : undefined,
        durationHours,
        amount,
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [...selectedMovement.electricityEntries, newEntry];
    }

    onUpdateMovementElectricity(selectedMovement.id, updatedEntries);
    setIsFormOpen(false);
    setEditingEntryId(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedMovement) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consommation électrique ?')) {
      const updated = selectedMovement.electricityEntries.filter((item) => item.id !== entryId);
      onUpdateMovementElectricity(selectedMovement.id, updated);
    }
  };

  // Preview current calculation in form
  const currentCalc = calculateElectricityDurationAndAmount(type, plugTime, unplugTime);
  const totalElectricityAmount = selectedMovement
    ? selectedMovement.electricityEntries.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Dossier Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              CONSOMMATION D’ÉNERGIE ÉLECTRIQUE
            </h2>
            <p className="text-xs text-slate-500">
              Gestion et facturation des branchements électriques au quai (Hors Taxes)
            </p>
          </div>
        </div>

        {/* Dossier Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label htmlFor="select-movement-dossier" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Dossier Actif :
          </label>
          <select
            id="select-movement-dossier"
            value={selectedMovement?.id || ''}
            onChange={(e) => onSelectMovement(e.target.value)}
            className="text-xs sm:text-sm font-semibold py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-amber-50/50 text-slate-900"
          >
            {movements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.clientCode} — {m.ownerName} ({m.boatName} - {m.registrationNumber}) [{m.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedMovement ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left: Vessel & Client Information Badge */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Dossier Rattaché</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedMovement.status === 'EN COURS' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedMovement.status}
              </span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Code Client :</span>
                <span className="font-bold text-slate-900 font-mono">{selectedMovement.clientCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Propriétaire :</span>
                <span className="font-bold text-slate-900">{selectedMovement.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Téléphone :</span>
                <span className="font-medium text-slate-900">{selectedMovement.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Adresse :</span>
                <span className="font-medium text-slate-900 text-right max-w-[60%]">{selectedMovement.address || '—'}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between">
                <span className="text-slate-500">Embarcation :</span>
                <span className="font-bold text-slate-900">{selectedMovement.boatName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Immatriculation :</span>
                <span className="font-mono text-slate-900">{selectedMovement.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Port d'attache :</span>
                <span className="font-medium text-slate-900">{selectedMovement.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mise à quai :</span>
                <span className="font-medium text-slate-900">{formatDate(selectedMovement.arrivalDate)}</span>
              </div>
            </div>

            {/* Tarifs summary reminder */}
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1 text-slate-700">
              <div className="font-bold text-amber-900 uppercase text-[11px] mb-1">Tarifs Officiels Électricité</div>
              <div className="flex justify-between">
                <span>Tarif horaire :</span>
                <span className="font-bold">30 DA / heure</span>
              </div>
              <div className="flex justify-between">
                <span>Demi-journée (4h) :</span>
                <span className="font-bold">600 DA</span>
              </div>
              <div className="flex justify-between">
                <span>Journée (8h) :</span>
                <span className="font-bold">1 200 DA</span>
              </div>
              <div className="pt-1 text-[10px] text-amber-800 font-semibold text-center border-t border-amber-200">
                Facturation HORS TAXES (Sans TVA ni timbre)
              </div>
            </div>

            {/* Print button */}
            <button
              id="btn-print-elec-sheet"
              onClick={() => onPrintElectricitySheet(selectedMovement)}
              className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Imprimer Fiche Électricité</span>
            </button>
          </div>

          {/* Right: Electric Registry & Entries */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header + Add button */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Registre des Branchements du Séjour
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMovement.electricityEntries.length} branchement(s) enregistré(s)
                </p>
              </div>

              <button
                id="btn-new-plug-entry"
                onClick={openNewForm}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>NOUVEAU BRANCHEMENT</span>
              </button>
            </div>

            {/* Form modal or collapsible */}
            {isFormOpen && (
              <form
                onSubmit={handleSaveEntry}
                className="bg-amber-50/80 border-2 border-amber-400 rounded-xl p-4 shadow-md space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    {editingEntryId ? 'Modifier le branchement' : 'Enregistrement d’un nouveau branchement'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {formError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="elec-input-date" className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      id="elec-input-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="elec-input-type" className="block text-xs font-semibold text-slate-700 mb-1">Type de consommation</label>
                    <select
                      id="elec-input-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as ElectricityType)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      <option value="Horaire">Horaire (30 DA / h)</option>
                      <option value="Demi-journée">Demi-journée (600 DA)</option>
                      <option value="Journée">Journée (1 200 DA)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="elec-input-voucher" className="block text-xs font-semibold text-slate-700 mb-1">N° Bon (Optionnel)</label>
                    <input
                      id="elec-input-voucher"
                      type="text"
                      placeholder="Ex: BE-102"
                      value={voucherNumber}
                      onChange={(e) => setVoucherNumber(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Time selection for hourly */}
                {type === 'Horaire' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-amber-200">
                    <div>
                      <label htmlFor="elec-input-plug" className="block text-xs font-semibold text-slate-700 mb-1">Heure de branchement</label>
                      <input
                        id="elec-input-plug"
                        type="time"
                        value={plugTime}
                        onChange={(e) => setPlugTime(e.target.value)}
                        className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="elec-input-unplug" className="block text-xs font-semibold text-slate-700 mb-1">Heure de débranchement</label>
                      <input
                        id="elec-input-unplug"
                        type="time"
                        value={unplugTime}
                        onChange={(e) => setUnplugTime(e.target.value)}
                        className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Live preview of cost */}
                <div className="flex items-center justify-between p-2.5 bg-amber-100/70 rounded-lg border border-amber-300 text-xs">
                  <div>
                    <span className="font-semibold text-amber-950">Calcul automatique : </span>
                    <span className="text-amber-800">
                      {type === 'Horaire'
                        ? `${currentCalc.durationHours} heure(s) × 30 DA`
                        : type === 'Demi-journée'
                        ? 'Forfait Demi-journée'
                        : 'Forfait Journée'}
                    </span>
                  </div>
                  <div className="text-sm font-black text-amber-950 font-mono">
                    {formatCurrency(currentCalc.amount)} (HT)
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-100 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    id="btn-save-elec-entry"
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Enregistrer la consommation</span>
                  </button>
                </div>
              </form>
            )}

            {/* Registry Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-slate-800 text-slate-200 font-semibold text-[11px] sm:text-xs">
                    <tr>
                      <th className="p-2.5">N° Bon</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 text-center">Heure Branch.</th>
                      <th className="p-2.5 text-center">Heure Débranch.</th>
                      <th className="p-2.5 text-center">Durée</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Montant (HT)</th>
                      <th className="p-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedMovement.electricityEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                          Aucun branchement enregistré. Cliquez sur « NOUVEAU BRANCHEMENT » pour ajouter une consommation.
                        </td>
                      </tr>
                    ) : (
                      selectedMovement.electricityEntries.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-medium text-slate-800">{item.voucherNumber || `BE-${idx + 1}`}</td>
                          <td className="p-2.5 font-medium">{formatDate(item.date)}</td>
                          <td className="p-2.5 text-center text-slate-600">{item.plugTime || '—'}</td>
                          <td className="p-2.5 text-center text-slate-600">{item.unplugTime || '—'}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-700">
                            {item.durationHours ? `${item.durationHours} h` : '—'}
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold text-slate-800">{item.type}</span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                id={`btn-edit-elec-${item.id}`}
                                onClick={() => openEditForm(item)}
                                className="p-1 text-slate-500 hover:text-sky-700 rounded hover:bg-slate-100"
                                title="Modifier"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                id={`btn-del-elec-${item.id}`}
                                onClick={() => handleDeleteEntry(item.id)}
                                className="p-1 text-slate-500 hover:text-red-700 rounded hover:bg-slate-100"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Box */}
              <div className="p-3 bg-amber-500 text-slate-950 font-extrabold flex justify-between items-center px-4">
                <span className="text-xs uppercase tracking-wider">
                  TOTAL ÉLECTRICITÉ (HORS TAXES) :
                </span>
                <span className="text-base sm:text-lg font-mono">
                  {formatCurrency(totalElectricityAmount)}
                </span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          Veuillez sélectionner ou créer une opération pour gérer sa consommation électrique.
        </div>
      )}
    </div>
  );
};
