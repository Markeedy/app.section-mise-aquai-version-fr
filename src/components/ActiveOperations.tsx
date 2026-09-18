import React, { useState } from 'react';
import { Movement } from '../types';
import { formatCurrency, formatDate, calculateDaysBetween } from '../utils/calculations';
import { Search, Anchor, Zap, ArrowRight, CheckCircle, Ship, Calendar, MapPin, Plus } from 'lucide-react';

interface ActiveOperationsProps {
  movements: Movement[];
  onOpenMovement: (movement: Movement) => void;
  onOpenElectricity: (movement: Movement) => void;
  onNewMovement: () => void;
  onQuickFinalize: (movement: Movement) => void;
}

export const ActiveOperations: React.FC<ActiveOperationsProps> = ({
  movements,
  onOpenMovement,
  onOpenElectricity,
  onNewMovement,
  onQuickFinalize,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPort, setSelectedPort] = useState<string>('all');

  const activeMovements = movements.filter((m) => m.status === 'EN COURS');

  const filteredMovements = activeMovements.filter((m) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      m.clientCode.toLowerCase().includes(term) ||
      m.ownerName.toLowerCase().includes(term) ||
      m.boatName.toLowerCase().includes(term) ||
      m.registrationNumber.toLowerCase().includes(term) ||
      m.port.toLowerCase().includes(term) ||
      m.phone.includes(term);

    const matchesPort = selectedPort === 'all' || m.port === selectedPort;

    return matchesSearch && matchesPort;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-800">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              OPÉRATIONS EN COURS SUR QUAI
            </h2>
            <p className="text-xs text-slate-500">
              {activeMovements.length} embarcation(s) actuellement en séjour de carénage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-new-quai-from-active"
            onClick={onNewMovement}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Mise à Quai</span>
          </button>
        </div>
      </div>

      {/* Search & Port Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="search-active-input"
            type="text"
            placeholder="Rechercher par Code client, Propriétaire, Embarcation, Immatriculation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <select
            id="filter-port-select"
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
          >
            <option value="all">Tous les ports</option>
            <option value="Tipaza">Port de Tipaza</option>
            <option value="Cherchell">Port de Cherchell</option>
            <option value="Bouharoun">Port de Bouharoun</option>
            <option value="Gouraya">Port de Gouraya</option>
            <option value="Khemisti">Port de Khemisti</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-800 text-slate-200 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Code Client</th>
                <th className="p-3">Propriétaire</th>
                <th className="p-3">Embarcation</th>
                <th className="p-3">Immatriculation</th>
                <th className="p-3">Port</th>
                <th className="p-3 text-center">Surface</th>
                <th className="p-3 text-center">Mise à quai</th>
                <th className="p-3 text-center">Jours en cours</th>
                <th className="p-3 text-center">Accès Grue</th>
                <th className="p-3 text-center">Électricité</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    <Ship className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Aucune opération en cours ne correspond à votre recherche.</p>
                    <p className="text-xs text-slate-400 mt-1">Créez une nouvelle mise à quai pour commencer un séjour.</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const daysRunning = calculateDaysBetween(m.arrivalDate, null);
                  const elecCount = m.electricityEntries.length;
                  const elecSum = m.electricityEntries.reduce((s, e) => s + (e.amount || 0), 0);

                  return (
                    <tr key={m.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {m.clientCode}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{m.ownerName}</div>
                        <div className="text-[11px] text-slate-500">{m.phone}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{m.boatName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {m.boatType}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {m.registrationNumber}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {m.port}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">
                        {m.surface} m²
                      </td>
                      <td className="p-3 text-center whitespace-nowrap text-slate-700">
                        {formatDate(m.arrivalDate)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                          {daysRunning} jour(s)
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {m.craneAccess ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            OUI (5 050 DA)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600">
                            NON
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {elecCount > 0 ? (
                          <button
                            id={`btn-elec-view-${m.id}`}
                            onClick={() => onOpenElectricity(m)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                            title="Gérer les consommations électriques"
                          >
                            <Zap className="h-3 w-3 text-amber-600" />
                            <span>{elecSum} DA ({elecCount})</span>
                          </button>
                        ) : (
                          <button
                            id={`btn-elec-add-${m.id}`}
                            onClick={() => onOpenElectricity(m)}
                            className="text-[11px] text-slate-500 hover:text-amber-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                          >
                            <Plus className="h-3 w-3" /> Brancher
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-open-dossier-${m.id}`}
                            onClick={() => onOpenMovement(m)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                            title="Ouvrir la fiche complète"
                          >
                            Ouvrir
                          </button>

                          <button
                            id={`btn-mise-eau-${m.id}`}
                            onClick={() => onQuickFinalize(m)}
                            className="px-2.5 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded flex items-center gap-1 shadow-xs transition-colors"
                            title="Renseigner la date de mise à l'eau et finaliser l'encaissement"
                          >
                            <span>Mise à l'eau</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
